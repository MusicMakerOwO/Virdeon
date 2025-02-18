type Config = {
	TOKEN: string,
	APP_ID: string
}

const ConfigTemplate : Record<string, string> = {
	TOKEN: 'string',
	APP_ID: 'string'
}

const config = require('../../config.json');

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