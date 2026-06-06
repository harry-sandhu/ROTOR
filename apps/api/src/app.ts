import Fastify, { type FastifyInstance } from "fastify";

import authRoutes from "./modules/auth/routes.js";
import adminCategoryRoutes from "./modules/admin/categories/routes.js";
import adminExportRoutes from "./modules/admin/exports/routes.js";
import adminImportRoutes from "./modules/admin/imports/routes.js";
import adminProductRoutes from "./modules/admin/products/routes.js";
import adminRuleRoutes from "./modules/admin/rules/routes.js";
import adminSpecificationRoutes from "./modules/admin/specifications/routes.js";
import buildsRoutes from "./modules/builds/routes.js";
import categoryRoutes from "./modules/categories/routes.js";
import compatibilityRoutes from "./modules/compatibility/routes.js";
import productRoutes from "./modules/products/routes.js";
import searchRoutes from "./modules/search/routes.js";
import specificationRoutes from "./modules/specifications/routes.js";
import validationRoutes from "./modules/validation/routes.js";
import authPlugin from "./plugins/auth.js";
import corsPlugin from "./plugins/cors.js";
import dbPlugin from "./plugins/db.js";
import envPlugin from "./plugins/env.js";
import errorHandlerPlugin from "./plugins/error-handler.js";
import openApiPlugin from "./plugins/openapi.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
  });

  await app.register(envPlugin);
  await app.register(corsPlugin);
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
    await api.register(buildsRoutes);
    await api.register(adminSpecificationRoutes);
    await api.register(adminCategoryRoutes);
    await api.register(adminRuleRoutes);
    await api.register(adminProductRoutes);
    await api.register(adminImportRoutes);
    await api.register(adminExportRoutes);
  }, { prefix: "/api/v1" });

  return app;
}
