// Converts all runtime errors to point to original typescript files
import 'source-map-support/register';

import { createBot, Intents } from "discordeno";
import EventLoader from "./Utils/EventLoader";
import ComponentLoader from "./Utils/ComponentLoader";
import config from "../Config";
import { Client } from "../types";
import { BindTokenCheck, CreateFastifyServer } from '../GlobalUtils/Fastify';
import Log from '../GlobalUtils/Logs';

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
client.prefix = new Map();

EventLoader('./Events', client);
ComponentLoader('Command', './Commands', client.commands);
ComponentLoader('Button', './Buttons', client.buttons);
ComponentLoader('Select', './Selects', client.selects);
ComponentLoader('Modal', './Modals', client.modals);
ComponentLoader('Prefix', './Prefix', client.prefix);

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

app.listen({ host: config.BOT_URL, port: config.BOT_PORT }, () => {
	Log('INFO', `Bot server listening on port ${config.BOT_PORT} - ${config.BOT_URL}:${config.BOT_PORT}`);
});

client.start();
