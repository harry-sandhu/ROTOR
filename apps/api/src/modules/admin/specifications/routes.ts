import type { FastifyPluginAsync } from "fastify";

import { createSpecificationSchema, specificationIdParamsSchema, updateSpecificationSchema } from "./schemas.js";
import { createSpecification, listSpecifications, removeSpecification, updateSpecification } from "./service.js";

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

const adminSpecificationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/admin/specifications", { preHandler: app.requireRole("ADMIN") }, async () => {
    return listSpecifications(app.db);
  });

  app.post("/admin/specifications", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const body = createSpecificationSchema.parse(request.body);
    return createSpecification(app.db, body);
  });

  app.patch("/admin/specifications/:specificationId", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { specificationId } = specificationIdParamsSchema.parse(request.params);
    const body = omitUndefined(updateSpecificationSchema.parse(request.body));
    return updateSpecification(app.db, specificationId, body as never);
  });

  app.delete("/admin/specifications/:specificationId", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { specificationId } = specificationIdParamsSchema.parse(request.params);
    return removeSpecification(app.db, specificationId);
  });
};

export default adminSpecificationRoutes;
