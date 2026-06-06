import type { FastifyPluginAsync } from "fastify";

import { createRuleSchema, ruleIdParamsSchema, updateRuleSchema } from "./schemas.js";
import { createRule, listRules, removeRule, updateRule } from "./service.js";

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined)) as T;
}

const adminRuleRoutes: FastifyPluginAsync = async (app) => {
  app.get("/admin/rules", { preHandler: app.requireRole("ADMIN") }, async () => {
    return listRules(app.db);
  });

  app.post("/admin/rules", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const body = createRuleSchema.parse(request.body);
    return createRule(app.db, body);
  });

  app.patch("/admin/rules/:ruleId", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { ruleId } = ruleIdParamsSchema.parse(request.params);
    const body = omitUndefined(updateRuleSchema.parse(request.body));
    return updateRule(app.db, ruleId, body as never);
  });

  app.delete("/admin/rules/:ruleId", { preHandler: app.requireRole("ADMIN") }, async (request) => {
    const { ruleId } = ruleIdParamsSchema.parse(request.params);
    return removeRule(app.db, ruleId);
  });
};

export default adminRuleRoutes;
