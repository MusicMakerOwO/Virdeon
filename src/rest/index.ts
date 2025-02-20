import fastifyMultipart from "@fastify/multipart"
import fastify from "fastify"
import config from "../Config"
import { createRestManager, RequestMethods } from "discordeno";
import Log from "../GlobalUtils/Logs";
import SecureStringTest from "../GlobalUtils/SecureStringTest";

const REST = createRestManager({
	token: config.TOKEN
});

const SAMPLE_TOKEN = 'XXXXXXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

const app = fastify({ logger: true })

app.register(fastifyMultipart, { attachFieldsToBody: true })

app.addHook('onRequest', async (request, reply) => {
	if (!SecureStringTest(request.headers.authorization ?? SAMPLE_TOKEN, config.TOKEN)) {
		Log('INFO', `Invalid request from ${request.ip}`);
		reply.status(401).send({ error: 'Unauthorized' });
	}
});

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
	} catch (e) {
		const error = e as Error;
		Log('ERROR', error.message);
		return reply.status(500).send({ error: error.message });
	}
});

app.listen({ port: config.REST_PORT }, () => {
	console.log(`REST server listening on port ${config.REST_PORT} - ${config.REST_URL}:${config.REST_PORT}`);
});

process.on('SIGINT', async () => {
	await app.close();
	process.exit();
});