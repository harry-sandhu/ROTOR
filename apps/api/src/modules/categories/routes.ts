import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { getActiveCategories, getCategorySpecifications } from "./service.js";

const categoryParamsSchema = z.object({
  categoryKey: z.string().min(1),
});

const categoryRoutes: FastifyPluginAsync = async (app) => {
  app.get("/categories", async () => {
    return getActiveCategories(app.db);
  });

  app.get("/categories/:categoryKey/specifications", async (request) => {
    const { categoryKey } = categoryParamsSchema.parse(request.params);

    return getCategorySpecifications(app.db, categoryKey);
  });
};

export default categoryRoutes;
