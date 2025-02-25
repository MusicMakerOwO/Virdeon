import config from "../../Config";
import { CommandFile } from "../../types";
import Log from "../../GlobalUtils/Logs";
import type { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v10";

const PUBLIC_ROUTE = `https://discord.com/api/v10/applications/${config.APP_ID}/commands`;

export default async function RegisterCommands(cache: Map<string, CommandFile>, silent = false) {

	if (!silent) Log('INFO', 'Registering (/) commands...');

	const commandNames = new Set<string>();
	const PublicCommands : RESTPostAPIApplicationCommandsJSONBody[] = [];

	const localCommands = [...cache.values()];
	for (let i = 0; i < localCommands.length; i++) {
		const command = localCommands[i];
		const commandData = command.command.toJSON();

		if (commandNames.has(commandData.name)) {
			Log('WARN', `Command name "${commandData.name}" is already in use`);
			continue;
		}

		commandNames.add(commandData.name);
		PublicCommands.push(commandData);
	}

	const response = await fetch(PUBLIC_ROUTE, {
		method: 'PUT',
		headers: {
			'Authorization': `Bot ${config.TOKEN}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(PublicCommands)
	});

	const json = await response.json();

	if (response.ok === false) {
		Log('ERROR', json);
		return;
	}

	if (!silent) Log('INFO', `Registered ${json.length} commands`);
}
