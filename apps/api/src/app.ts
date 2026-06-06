import Fastify, { type FastifyInstance } from "fastify";

import authPlugin from "./plugins/auth.js";
import dbPlugin from "./plugins/db.js";
import envPlugin from "./plugins/env.js";
import errorHandlerPlugin from "./plugins/error-handler.js";
import openApiPlugin from "./plugins/openapi.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  });

  await app.register(envPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(dbPlugin);
  await app.register(authPlugin);
  await app.register(openApiPlugin);

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "@rotor/api",
    };
  });

  return app;
}
