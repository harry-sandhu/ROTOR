import type { FastifyPluginAsync } from "fastify";

import { compatibilityEvaluateRequestSchema } from "@rotor/contracts";
import { productSpecificationInputSchema } from "@rotor/contracts";

import { validateBuildSelections, validateProductSpecifications } from "./service.js";

const validationRoutes: FastifyPluginAsync = async (app) => {
  app.post("/validation/products", async (request) => {
    const body = productSpecificationInputSchema.parse(request.body);
    return validateProductSpecifications(app.db, body);
  });

  app.post("/validation/builds", async (request) => {
    const body = compatibilityEvaluateRequestSchema.parse(request.body);
    return validateBuildSelections(app.db, body);
  });
};

export default validationRoutes;
