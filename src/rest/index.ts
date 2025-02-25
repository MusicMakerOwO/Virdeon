import config from "../Config"
import { createRestManager, RequestMethods } from "discordeno";
import Log from "../GlobalUtils/Logs";
import { BindServerShutdown, BindTokenCheck, CreateFastifyServer } from "../GlobalUtils/Fastify";

const REST = createRestManager({
	token: config.TOKEN
});

const app = CreateFastifyServer();

BindTokenCheck(app);
BindServerShutdown(app);

app.all('/*', async (request, reply) => {

	Log('INFO', `Request from ${request.ip} : ${request.url}`);

	if (request.url.startsWith('/uptime')) {
		reply.status(200).send({ uptime: process.uptime() });
		return;
	}

	const hasBody = request.method !== 'DELETE' && request.method !== 'GET' && request.method !== 'HEAD';

	try {
		const result = await REST.makeRequest(request.method as RequestMethods, request.url.slice(4), {
			body: hasBody ? request.body : undefined
		});

		if (result) {
			return reply.status(200).send(result);
		} else {
			return reply.status(204).send();
		}
	} catch (error) {
		Log('ERROR', error);
		return reply.status(500).send({ error: error instanceof Error ? error.message : error });
	}
});

app.listen({ host: config. REST_URL, port: config.REST_PORT }, () => {
	Log('INFO', `REST server listening on port ${config.REST_PORT} - ${config.REST_URL}:${config.REST_PORT}`);
});