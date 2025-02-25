import { existsSync } from "node:fs";
import { CommandFile, ComponentFile } from "../../types";
import ReadFolder from "../../GlobalUtils/ReadFolder";
import Log from "../../GlobalUtils/Logs";

export default function (type: string, folder: string, cache: Map<string, CommandFile | ComponentFile>, silent = false) {

	if (!existsSync(`${__dirname}/../${folder}`)) {
		if (!silent) Log('ERROR', `Folder ${folder} does not exist`);
		return;
	}

	const files = ReadFolder(`${__dirname}/../${folder}`);
	for (const file of files) {
		if (!file.endsWith('.js')) continue;
		let component = require(file) as CommandFile | ComponentFile | { default: CommandFile | ComponentFile };
		if ('default' in component) component = component.default;

		try {
			if (typeof component !== 'object') throw 'Component must be an object';

			// shared properties
			if (typeof component.locks !== 'object') component.locks = {};
			if (typeof component.execute !== 'function') throw 'Component must have an execute function';

			let key: string;
			let value: CommandFile | ComponentFile;

			if ('command' in component) {
				if (typeof component.command !== 'object') throw 'Command must be an object';
				if (cache.has(component.command.name)) throw `Duplicate command name "${component.command.name}"`;
				key = component.command.name;
				value = component;
			} else {
				if (typeof component.customID !== 'string') throw 'Component must have a customID';
				if (cache.has(component.customID)) throw `Duplicate customID "${component.customID}"`;
				key = component.customID;
				value = component;
			}

			value = Object.defineProperty(value, 'filePath', { value: file });
			value = Object.defineProperty(value, 'customID', { value: key });

			cache.set(key, value);
		} catch (error) {
			Log('ERROR', `Error loading ${type} from ${file}: ${error}`);
		}
	}

	if (!silent) Log('INFO', `Loaded ${files.length} ${type}s`);
}