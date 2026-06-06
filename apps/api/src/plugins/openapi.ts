import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

const openApiPlugin: FastifyPluginAsync = fp(async (app) => {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Rotor API",
        version: "0.1.0",
        description: "Compatibility-first drone building API.",
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
  });
});

export default openApiPlugin;
