import { createGatewayManager, createRestManager, GatewayIntents, type GatewayManager } from "discordeno";
import config from "../Config";
import { BindTokenCheck, CreateFastifyServer } from "../GlobalUtils/Fastify";
import Log from "../GlobalUtils/Logs";

const REST = createRestManager({
	token: config.TOKEN,
	proxy: {
		baseUrl: config.REST_URL,
		authorization: config.TOKEN
	}
});

export const GatewayEvents = {
	REQUEST_MEMBERS: 'REQUEST_MEMBERS'
}

let GATEWAY: GatewayManager | null = null;
export async function getGateway() : Promise<GatewayManager> {
	if (GATEWAY) return GATEWAY;

	GATEWAY = createGatewayManager({
		token: config.TOKEN,
		intents: GatewayIntents.Guilds | GatewayIntents.GuildMessages,
		shardsPerWorker: 5,
		totalWorkers: 1,
		connection: await REST.getSessionInfo()
	});

	return GATEWAY;
}

const app = CreateFastifyServer();
BindTokenCheck(app);

app.all('/*', async (request, reply) => {

	Log('INFO', `Request from ${request.ip} : ${request.url}`);

	if (request.url.startsWith('/uptime')) {
		reply.status(200).send({ uptime: process.uptime() });
		return;
	}

	const GATEWAY = await getGateway();

	const body = request.body as Record<string, any>;
	
	try {
		switch (body.type) {
			case GatewayEvents.REQUEST_MEMBERS:
				return await GATEWAY.requestMembers(body.guildId, body.options);
			default:
				Log('ERROR', `Unknown request type : ${JSON.stringify(body)}`);
				return reply.status(404).send({ error: 'Unknown request type' });
		}
	} catch (error) {
		Log('ERROR', error);
		return reply.status(500).send({ error: error instanceof Error ? error.message : error });
	}
});

app.listen({ host: config.GATEWAY_URL, port: config.GATEWAY_PORT }, () => {
	Log('INFO', `Gateway server listening on port ${config.GATEWAY_PORT} - ${config.GATEWAY_URL}:${config.GATEWAY_PORT}`);
});