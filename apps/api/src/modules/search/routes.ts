import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { getSearchSuggestions, searchProducts } from "./service.js";

const searchQuerySchema = z.object({
  q: z.string().min(1),
  category: z.string().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
});

const suggestionQuerySchema = z.object({
  q: z.string().min(1),
});

const searchRoutes: FastifyPluginAsync = async (app) => {
  app.get("/search/products", async (request) => {
    const query = searchQuerySchema.parse(request.query);
    return searchProducts(app.db, query);
  });

  app.get("/search/suggestions", async (request) => {
    const query = suggestionQuerySchema.parse(request.query);
    return getSearchSuggestions(app.db, query.q);
  });
};

export default searchRoutes;
