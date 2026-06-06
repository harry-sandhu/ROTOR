import type { FastifyPluginAsync } from "fastify";

import { importAdminProductsSchema } from "../products/schemas.js";
import { importAdminProducts } from "./service.js";

const adminImportRoutes: FastifyPluginAsync = async (app) => {
  app.post("/admin/import/products", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const body = importAdminProductsSchema.parse(request.body);
    return importAdminProducts(app.db, body);
  });
};

export default adminImportRoutes;
