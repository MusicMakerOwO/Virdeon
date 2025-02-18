import { createBot } from "discordeno";
import config from "./Utils/Config";
import EventLoader from "./Utils/EventLoader";
import { Client } from "./types";
import ComponentLoader from "./Utils/ComponentLoader";

console.time('Startup');

const client = createBot({
	token: config.TOKEN,
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
