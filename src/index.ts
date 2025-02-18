import { createBot } from "discordeno";
import config from "./Utils/Config";
import EventLoader from "./Utils/EventLoader";
import { Client } from "./types";
import CommandLoader from "./Utils/CommandLoader";

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

EventLoader(client);
CommandLoader(client);

console.log(client.commands);

client.start();
