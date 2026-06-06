import type { FastifyPluginAsync } from "fastify";

import { getSpecificationDefinitions } from "./service.js";

const specificationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/specifications", async () => {
    return getSpecificationDefinitions(app.db);
  });
};

export default specificationRoutes;
