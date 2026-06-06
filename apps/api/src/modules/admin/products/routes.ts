import type { FastifyPluginAsync } from "fastify";

import { createAdminProductSchema, productIdParamsSchema, updateAdminProductSchema } from "./schemas.js";
import {
  createProductForAdmin,
  deleteProductForAdmin,
  getProductForAdmin,
  listProductsForAdmin,
  publishProductForAdmin,
  updateProductForAdmin,
} from "./service.js";

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

const adminProductRoutes: FastifyPluginAsync = async (app) => {
  app.get("/admin/products", { preHandler: app.requireRole("ADMIN") }, async () => {
    return listProductsForAdmin(app.db);
  });

  app.post("/admin/products", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const body = createAdminProductSchema.parse(request.body);
    return createProductForAdmin(app.db, body);
  });

  app.get("/admin/products/:productId", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { productId } = productIdParamsSchema.parse(request.params);
    return getProductForAdmin(app.db, productId);
  });

  app.patch("/admin/products/:productId", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { productId } = productIdParamsSchema.parse(request.params);
    const body = omitUndefined(updateAdminProductSchema.parse(request.body));
    return updateProductForAdmin(app.db, productId, body as never);
  });

  app.delete("/admin/products/:productId", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { productId } = productIdParamsSchema.parse(request.params);
    return deleteProductForAdmin(app.db, productId);
  });

  app.post("/admin/products/:productId/publish", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { productId } = productIdParamsSchema.parse(request.params);
    return publishProductForAdmin(app.db, productId);
  });
};

export default adminProductRoutes;
