// Converts all runtime errors to point to original typescript files
import 'source-map-support/register';

import { createBot, Intents } from "discordeno";
import EventLoader from "./Utils/EventLoader";
import ComponentLoader from "./Utils/ComponentLoader";
import config from "../Config";
import { Client } from "../types";

const client = createBot({
	token: config.TOKEN,
	intents: Intents.Guilds | Intents.GuildMessages,
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

client.start();
