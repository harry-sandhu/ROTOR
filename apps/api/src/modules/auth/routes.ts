import type { FastifyPluginAsync } from "fastify";

import { loginRequestSchema, registerRequestSchema } from "@rotor/contracts";

import { getCurrentUser, loginUser, registerUser } from "./service.js";

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (request) => {
    const body = registerRequestSchema.parse(request.body);

    return registerUser(app.db, app.jwt, body);
  });

  app.post("/auth/login", async (request) => {
    const body = loginRequestSchema.parse(request.body);

    return loginUser(app.db, app.jwt, body);
  });

  app.get(
    "/auth/me",
    {
      preHandler: app.authenticate,
    },
    async (request) => {
      return getCurrentUser(app.db, request.user.sub);
    },
  );
};

export default authRoutes;
