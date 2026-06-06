import Fastify, { type FastifyInstance } from "fastify";

import authRoutes from "./modules/auth/routes.js";
import categoryRoutes from "./modules/categories/routes.js";
import compatibilityRoutes from "./modules/compatibility/routes.js";
import productRoutes from "./modules/products/routes.js";
import searchRoutes from "./modules/search/routes.js";
import specificationRoutes from "./modules/specifications/routes.js";
import validationRoutes from "./modules/validation/routes.js";
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

  await app.register(async (api) => {
    await api.register(authRoutes);
    await api.register(categoryRoutes);
    await api.register(specificationRoutes);
    await api.register(productRoutes);
    await api.register(searchRoutes);
    await api.register(validationRoutes);
    await api.register(compatibilityRoutes);
  }, { prefix: "/api/v1" });

  return app;
}
