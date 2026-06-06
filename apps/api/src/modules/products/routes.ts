import type { FastifyPluginAsync } from "fastify";

import { productIdParamsSchema, productListQuerySchema, productSlugParamsSchema } from "./schemas.js";
import { getCatalogProductById, getCatalogProductBySlug, listCatalogProducts } from "./service.js";

const productRoutes: FastifyPluginAsync = async (app) => {
  app.get("/products", async (request) => {
    const query = productListQuerySchema.parse(request.query);

    return listCatalogProducts(app.db, query);
  });

  app.get("/products/slug/:slug", async (request) => {
    const { slug } = productSlugParamsSchema.parse(request.params);

    return getCatalogProductBySlug(app.db, slug);
  });

  app.get("/products/:productId", async (request) => {
    const { productId } = productIdParamsSchema.parse(request.params);

    return getCatalogProductById(app.db, productId);
  });
};

export default productRoutes;
