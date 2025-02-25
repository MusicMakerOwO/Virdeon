// Converts all runtime errors to point to original typescript files
import 'source-map-support/register';

import { createBot, Intents } from "discordeno";
import EventLoader from "./Utils/EventLoader";
import ComponentLoader from "./Utils/ComponentLoader";
import config from "../Config";
import { Client, CommandFile } from "../types";
import { BindTokenCheck, CreateFastifyServer } from '../GlobalUtils/Fastify';
import Log from '../GlobalUtils/Logs';
import { FolderWatcher } from './Utils/FolderWatcher';
import { build } from 'esbuild';
import Debounce from '../GlobalUtils/Debounce';
import ReadFolder from '../GlobalUtils/ReadFolder';
import { existsSync } from 'fs';
import RegisterCommands from './Utils/RegisterCommands';

const client = createBot({
	token: config.TOKEN,
	intents: Intents.Guilds | Intents.GuildMessages,
	rest: {
		proxy: {
			baseUrl: `http://${config.REST_URL}:${config.REST_PORT}`,
			authorization: config.TOKEN
		}
	},
	desiredProperties: {
		interaction: {
			type: true,
			data: true,
			user: true,
			id: true,
			token: true
		},
		user: {
			username: true,
			id: true
		}
	}
}) as Client;

client.commands = new Map();
client.buttons = new Map();
client.selects = new Map();
client.modals = new Map();

EventLoader('./Events', client);

const COMPONENT_NAMES = {
	'./Commands': 'commands',
	'./Buttons': 'buttons',
	'./Selects': 'selects',
	'./Modals': 'modals',
}

const COMPONENT_CACHE : Record<keyof typeof COMPONENT_NAMES, Map<string, any>> = {
	'./Commands': client.commands,
	'./Buttons': client.buttons,
	'./Selects': client.selects,
	'./Modals': client.modals,
}

for (const [folder, name] of Object.entries(COMPONENT_NAMES)) {
	if (!existsSync(`${__dirname}/${folder}`)) {
		delete COMPONENT_NAMES[folder as keyof typeof COMPONENT_NAMES];
		delete COMPONENT_CACHE[folder as keyof typeof COMPONENT_CACHE];
		Log('WARN', `Folder ${folder} does not exist`);
		continue;
	}
	ComponentLoader(name, folder, COMPONENT_CACHE[folder as keyof typeof COMPONENT_CACHE]);
}

RegisterCommands(client);

const app = CreateFastifyServer();
BindTokenCheck(app);

app.all('/', async (request, reply) => {

	if (request.url.startsWith('/uptime')) {
		reply.status(200).send({ uptime: process.uptime() });
		return;
	}

	const body = request.body as Record<string, any>;

	try {
		client.events.raw?.(body.payload, body.shardId);

		if (body.payload.t) {
			client.handlers[body.data.t as keyof typeof client['handlers']]?.(client, body.payload, body.shardId);
		}

		reply.status(200).send({ success: true });
	} catch (error) {
		Log('ERROR', error);
		reply.status(500).send({ error: error instanceof Error ? error.message : error });
	}
});

function CleanPath(path: string) {
	return path.replace(__dirname, '').replace(/^[\/\.]+/, '');
}

// TS realtime compiler
async function CompileTS(filePath: string) {
	const outputPath = filePath.replace('src', 'build').replace('.ts', '.js');

	// it's not the same as tsc but it's fast and it works lol
	// The next time you run the build command it will be compiled with tsc
	// This is just for runtime hot reload
	try {
		await build({
			entryPoints: [filePath],
			outfile: outputPath,
			tsconfig: `${__dirname}/../../tsconfig.json`,
			platform: 'node',
			format: 'cjs',
			target: 'esnext'
		});

		Log('INFO', `Compiled ${CleanPath(filePath)} to ${CleanPath(outputPath)}`);
	} catch (error) {
		Log('ERROR', error);
	}
}

// JS runtime after compiliation
// @ts-ignore
async function HotReload(folder: keyof typeof COMPONENT_NAMES, filePath: string) {

	const start = process.hrtime.bigint();

	const cache = COMPONENT_CACHE[folder];
	const componentName = COMPONENT_NAMES[folder];

	let component = require(filePath);
	if ('default' in component) {
		component = component.default;
	}

	const name : string = 
		( component.customID ?? component.customId ?? component.custom_id ) ??
		component.command?.name ??
		component.name

	const oldComponent = cache.get(name);

	// Clear the cache, prepare to load everything again
	const filePaths = ReadFolder(`${__dirname}/${folder}`);
	for (let i = 0; i < filePaths.length; i++) {
		delete require.cache[ require.resolve( filePaths[i] ) ];
	}

	cache.clear();

	ComponentLoader(componentName, folder, cache, true);

	const end = process.hrtime.bigint();
	const time = Number(end - start) / 1e6;

	Log('INFO', `Reloaded ${cache.size} ${componentName} in ${time.toFixed(2)} ms`);

	const newComponent = cache.get(name);

	let needsRegister = false;
	if (cache === client.commands) {
		if (!oldComponent || !newComponent) {
			needsRegister = true;
		} else {
			const oldCommandData = (oldComponent as CommandFile).command.toJSON();
			const newCommandData = (newComponent as CommandFile).command.toJSON();

			// check the objects against each other
			needsRegister = JSON.stringify(oldCommandData) !== JSON.stringify(newCommandData);
		}
	}

	if (needsRegister) {
		await RegisterCommands(client);
		// Log('INFO', `Command "/${name}" has been updated`);
	}


}

client.events.ready = () => {
	Log('INFO', 'Ready!');

	const CompilerCallback = Debounce(CompileTS, 1000);

	// Any edits get compiled on the fly
	// The runtime hot reload will then apply the new edits
	const TSWatcher = new FolderWatcher(`${__dirname}/../../src`);
	TSWatcher.onChange = CompilerCallback;
	TSWatcher.onRemove = CompilerCallback;
	TSWatcher.onAdd = CompilerCallback;

	for (const folder of Object.keys(COMPONENT_NAMES)) {
		if (!existsSync(`${__dirname}/${folder}`)) continue;

		const ComponentWatcher = new FolderWatcher(`${__dirname}/${folder}`);
		const callback = HotReload.bind(null, folder as keyof typeof COMPONENT_NAMES);
		
		ComponentWatcher.onChange = callback;
		ComponentWatcher.onRemove = callback;
		ComponentWatcher.onAdd = callback;
	}
}

app.listen({ host: config.BOT_URL, port: config.BOT_PORT }, () => {
	Log('INFO', `Bot server listening on port ${config.BOT_PORT} - ${config.BOT_URL}:${config.BOT_PORT}`);
});

client.start();
