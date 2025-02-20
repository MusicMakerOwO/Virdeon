import config from "../Config"
import { createRestManager, RequestMethods } from "discordeno";
import Log from "../GlobalUtils/Logs";
import { BindTokenCheck, CreateFastifyServer } from "../GlobalUtils/Fastify";

const REST = createRestManager({
	token: config.TOKEN
});

const app = CreateFastifyServer();

BindTokenCheck(app);

app.get('/uptime', async (request, reply) => {
	return reply.status(200).send({ uptime: process.uptime() });
});

app.all('/api/*', async (request, reply) => {
	let hasBody = request.method !== 'DELETE' && request.method !== 'GET';

	try {
		const result = await REST.makeRequest(request.method as RequestMethods, request.url.substring(4).replace('/api', ''), {
			body: hasBody ? request.body : {}
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

app.listen({ port: config.REST_PORT }, () => {
	console.log(`REST server listening on port ${config.REST_PORT} - ${config.REST_URL}:${config.REST_PORT}`);
});