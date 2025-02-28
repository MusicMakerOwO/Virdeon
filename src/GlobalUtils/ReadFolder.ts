import fs from 'node:fs';
import Log from './Logs';

const files: string[] = []; // string[] of paths
const driveLetterRegex = /^[A-Z]:\\/i;

export default function (path: string, depth = 3) {
	if (!path.startsWith('/') && !driveLetterRegex.test(path)) throw new Error(`Path must be absolute - Received ${path}`);
	if (path.endsWith('/')) path = path.slice(0, -1);
	files.length = 0;
	ReadFolder(path, depth);
	return files;
}

function ReadFolder(path: string, depth = 3) {
	const folderEntries = fs.readdirSync(path, { withFileTypes: true });

	for (let i = 0; i < folderEntries.length; i++) {
		const entry = folderEntries[i];
		const fullPath = `${path}/${entry.name}`;

		if (entry.isDirectory()) {
			if (depth <= 0) {
				Log('WARN', `Maximum depth reached - Skipping ${fullPath}`);
			} else {
				ReadFolder(fullPath, depth - 1);
			}
			continue;
		}

		files.push(fullPath);
	}
};
