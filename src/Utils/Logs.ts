// [TYPE] YYYY-MM-DD HH-MM-SS : message

import { inspect } from "node:util";

export enum COLOR {
	RED = '\x1b[31m',
	GREEN = '\x1b[32m',
	YELLOW = '\x1b[33m',
	BLUE = '\x1b[34m',
	MAGENTA = '\x1b[35m',
	CYAN = '\x1b[36m',
	WHITE = '\x1b[37m',
	RESET = '\x1b[0m',
	BRIGHT = '\x1b[1m',
	DIM = '\x1b[2m',
}

export const LOG_TYPE = {
	INFO: 'INFO',
	WARN: 'WARN',
	ERROR: 'ERROR',
	DEBUG: 'DEBUG',
	TRACE: 'TRACE',
}

const LOG_COLOR = {
	[LOG_TYPE.INFO]: COLOR.CYAN,
	[LOG_TYPE.WARN]: COLOR.YELLOW,
	[LOG_TYPE.ERROR]: COLOR.RED + COLOR.BRIGHT,
	[LOG_TYPE.DEBUG]: COLOR.GREEN,
	[LOG_TYPE.TRACE]: COLOR.BLUE,
}

// Just so we can make the logs look pretty and aligned
const LONGEST_LOG_TYPE = Math.max(...Object.keys(LOG_TYPE).map((type) => type.length));

export function GetTimestamp() {
	const date = new Date();
	const year = date.getFullYear().toString().padStart(4, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const hours = date.getHours().toString().padStart(2, '0');
	const minutes = date.getMinutes().toString().padStart(2, '0');
	const seconds = date.getSeconds().toString().padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export default function Log(type: keyof typeof LOG_TYPE, message: any) {
	const logType = '[' + type.toUpperCase() + ']'.padEnd(LONGEST_LOG_TYPE + 1 - type.length);
	const isError = type === LOG_TYPE.ERROR;
	const timestamp = GetTimestamp();
	const color = LOG_COLOR[type];
	const messageString = typeof message === 'string' ? message : inspect(message, { depth: 3, colors: !isError });
	console.log(`${color}${logType} ${timestamp} : ${!isError ? COLOR.RESET : ''}${messageString}${COLOR.RESET}`);
}

// Log.info('Hello, world!'); -> [INFO] 2021-08-01 12:00:00 : Hello, world!

