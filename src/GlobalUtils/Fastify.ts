import fastifyMultipart from "@fastify/multipart";
import fastify, { FastifyInstance, type FastifyServerOptions } from "fastify";
import Log from "./Logs";
import SecureStringTest from "./SecureStringTest";
import config from "../Config";

const SAMPLE_TOKEN = 'XXXXXXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export function CreateFastifyServer(options?: FastifyServerOptions) {
	const app = fastify(options);

	app.register(fastifyMultipart, { attachFieldsToBody: true });

	process.on('SIGINT', async () => {
		Log('INFO', 'Shutting down Fastify server...');
		await app.close();
		process.exit(0);
	});

	return app;
}

export function BindTokenCheck(app: FastifyInstance) {
	app.addHook('onRequest', async (request, reply) => {
		if (!SecureStringTest(request.headers.authorization ?? SAMPLE_TOKEN, config.TOKEN)) {
			Log('INFO', `Invalid request from ${request.ip}`);
			reply.status(401).send({ error: 'Unauthorized' });
		}
	});
}