import type { FastifyPluginAsync } from "fastify";

import { compatibilityEvaluateRequestSchema, compatibilityOptionsRequestSchema } from "@rotor/contracts";

import { getCompatibleOptions } from "./option-service.js";
import { evaluateBuildCompatibility } from "./service.js";

const compatibilityRoutes: FastifyPluginAsync = async (app) => {
  app.post("/compatibility/evaluate", async (request) => {
    const body = compatibilityEvaluateRequestSchema.parse(request.body);
    return evaluateBuildCompatibility(app.db, body.selections);
  });

  app.post("/compatibility/options", async (request) => {
    const body = compatibilityOptionsRequestSchema.parse(request.body);
    return getCompatibleOptions(app.db, body);
  });
};

export default compatibilityRoutes;
