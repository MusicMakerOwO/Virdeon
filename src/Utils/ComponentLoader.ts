import ReadFolder from "./ReadFolder";
import { CommandFile, ComponentFile } from "../types";
import Log from "./Logs";
import { existsSync } from "fs";

export default function (type: string, folder: string, cache: Map<string, CommandFile | ComponentFile>) {

	if (!existsSync(`${__dirname}/../${folder}`)) {
		Log('ERROR', `Folder ${folder} does not exist`);
		return;
	}

	const files = ReadFolder(`${__dirname}/../${folder}`);
	for (const file of files) {
		if (!file.endsWith('.js')) continue;
		let command = require(file) as CommandFile | ComponentFile;

		if (typeof command.default === 'object') {
			command = command.default;
		}

		try {
			if ('command' in command) {
				const commandPayload = command.command.toJSON();
				cache.set(commandPayload.name, command);
			} else {
				const customID = command.customID ?? command.customId ?? command.custom_id ?? file.split('/').pop()!.split('.').shift()!;
				if (!customID) throw 'Component must have a customID';
				cache.set(customID, command);
			}
		} catch (error) {
			Log('ERROR', `Error loading ${type} from ${file}: ${error}`);
		}
	}

	Log('INFO', `Loaded ${files.length} ${type}s`);
}