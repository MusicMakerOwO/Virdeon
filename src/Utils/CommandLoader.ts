import ReadFolder from "./ReadFolder";
import { Client, CommandFile } from "../types";

export default function (client: Client) {
	const files = ReadFolder(`${__dirname}/../Commands`);
	for (const file of files) {
		const command = require(file) as CommandFile;
		const commandPayload = command.command.toJSON();
		client.commands.set(commandPayload.name, command);
	}
}