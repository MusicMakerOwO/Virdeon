import { existsSync } from "node:fs";
import { CommandFile, ComponentFile, MessageFile } from "../../types";
import ReadFolder from "../../GlobalUtils/ReadFolder";
import Log from "../../GlobalUtils/Logs";

export default function (type: string, folder: string, cache: Map<string, CommandFile | ComponentFile | MessageFile>) {

	if (!existsSync(`${__dirname}/../${folder}`)) {
		Log('ERROR', `Folder ${folder} does not exist`);
		return;
	}

	const files = ReadFolder(`${__dirname}/../${folder}`);
	for (const file of files) {
		if (!file.endsWith('.js')) continue;
		let component = require(file) as CommandFile | ComponentFile | MessageFile | { default: CommandFile | ComponentFile | MessageFile };
		if ('default' in component) component = component.default;

		try {
			if (typeof component !== 'object') throw 'Component must be an object';

			// shared properties
			if (typeof component.locks !== 'object') component.locks = {};
			if (typeof component.execute !== 'function') throw 'Component must have an execute function';

			if ('command' in component) {
				if (typeof component.command !== 'object') throw 'Command must be an object';
				if (cache.has(component.command.name)) throw `Duplicate command name "${component.command.name}"`;
				cache.set(component.command.name, component);
			} else if ('name' in component) {
				if (typeof component.name !== 'string') throw 'Component must have a name';
				if (component.description !== undefined && typeof component.description !== 'string') throw 'Description must be a string';
				if (cache.has(component.name)) throw `Duplicate name "${component.name}"`;
				cache.set(component.name, component);
			} else {
				const id = component.customID ?? component.customId ?? component.custom_id;
				if (typeof id !== 'string') throw 'Component must have a customID';
				if (cache.has(id)) throw `Duplicate customID "${id}"`;
				cache.set(id, component);
			}
		} catch (error) {
			Log('ERROR', `Error loading ${type} from ${file}: ${error}`);
		}
	}

	Log('INFO', `Loaded ${files.length} ${type}s`);
}