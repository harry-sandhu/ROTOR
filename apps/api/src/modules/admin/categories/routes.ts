import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { adminCategorySpecificationAssignmentSchema } from "@rotor/contracts";

import { getCategoryAssignments, updateCategoryAssignments } from "./service.js";

const paramsSchema = z.object({
  categoryKey: z.string().min(1),
});

const bodySchema = z.object({
  items: z.array(adminCategorySpecificationAssignmentSchema),
});

const adminCategoryRoutes: FastifyPluginAsync = async (app) => {
  app.get("/admin/categories/:categoryKey/specifications", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { categoryKey } = paramsSchema.parse(request.params);
    return getCategoryAssignments(app.db, categoryKey);
  });

  app.put("/admin/categories/:categoryKey/specifications", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { categoryKey } = paramsSchema.parse(request.params);
    const body = bodySchema.parse(request.body);
    return updateCategoryAssignments(app.db, categoryKey, body.items);
  });
};

export default adminCategoryRoutes;
