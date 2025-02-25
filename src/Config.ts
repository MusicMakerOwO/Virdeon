type Config = {
	TOKEN: string,
	APP_ID: string,
	
	REST_URL: string,
	REST_PORT: number,
	
	GATEWAY_URL: string,
	GATEWAY_PORT: number,

	BOT_URL: string,
	BOT_PORT: number
}

const ConfigTemplate : Record<string, string> = {
	TOKEN: 'string',
	APP_ID: 'string',
	REST_URL: 'string',
	REST_PORT: 'number',
	GATEWAY_URL: 'string',
	GATEWAY_PORT: 'number',
	BOT_URL: 'string',
	BOT_PORT: 'number'
}

const config = require('../config.json');

for (const [key, type] of Object.entries(ConfigTemplate)) {
	if (typeof config[key] !== type) {
		throw new Error(`Config key ${key} is not of type ${type}`);
	}
}

for (const key of Object.keys(config)) {
	if (!Object.keys(ConfigTemplate).includes(key)) {
		throw new Error(`Config key ${key} is not in the template`);
	}
}

export default config as Config;