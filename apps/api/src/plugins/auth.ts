import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

import { forbidden, unauthorized } from "../lib/errors.js";

const authPlugin: FastifyPluginAsync = fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: app.appEnv.JWT_SECRET,
  });

  app.decorate("authenticate", async (request) => {
    try {
      await request.jwtVerify();
    } catch {
      throw unauthorized("AUTH_REQUIRED", "Authentication is required.");
    }
  });

  app.decorate("requireRole", (role) => async (request) => {
    try {
      await request.jwtVerify();
    } catch {
      throw unauthorized("AUTH_REQUIRED", "Authentication is required.");
    }

    if (request.user.role !== role) {
      throw forbidden("FORBIDDEN", `Role ${role} is required.`);
    }
  });
});

export default authPlugin;
