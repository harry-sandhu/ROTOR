import type { FastifyPluginAsync } from "fastify";

import {
  createBuildRequestSchema,
  updateBuildComponentRequestSchema,
  updateBuildRequestSchema,
  buildComponentParamsSchema,
  buildIdParamsSchema,
} from "./schemas.js";
import {
  createUserBuild,
  deleteUserBuild,
  duplicateBuild,
  getBuildCompatibilitySnapshot,
  getSharedBuildDetail,
  getUserBuildDetail,
  listUserBuilds,
  removeBuildComponent,
  updateUserBuild,
  upsertBuildComponent,
} from "./service.js";

const buildRoutes: FastifyPluginAsync = async (app) => {
  app.get("/builds", { preHandler: app.authenticate }, async (request) => {
    return listUserBuilds(app.db, request.user.sub);
  });

  app.post("/builds", { preHandler: app.authenticate }, async (request) => {
    const body = createBuildRequestSchema.parse(request.body);
    return createUserBuild(app.db, request.user.sub, body);
  });

  app.get("/builds/:buildId", { preHandler: app.authenticate }, async (request) => {
    const { buildId } = buildIdParamsSchema.parse(request.params);
    return getUserBuildDetail(app.db, buildId, request.user.sub);
  });

  app.patch("/builds/:buildId", { preHandler: app.authenticate }, async (request) => {
    const { buildId } = buildIdParamsSchema.parse(request.params);
    const body = updateBuildRequestSchema.parse(request.body);
    return updateUserBuild(app.db, buildId, request.user.sub, body);
  });

  app.delete("/builds/:buildId", { preHandler: app.authenticate }, async (request) => {
    const { buildId } = buildIdParamsSchema.parse(request.params);
    return deleteUserBuild(app.db, buildId, request.user.sub);
  });

  app.put("/builds/:buildId/components/:categoryKey", { preHandler: app.authenticate }, async (request) => {
    const { buildId, categoryKey } = buildComponentParamsSchema.parse(request.params);
    const body = updateBuildComponentRequestSchema.parse(request.body);
    return upsertBuildComponent(app.db, buildId, request.user.sub, categoryKey, body);
  });

  app.delete("/builds/:buildId/components/:categoryKey", { preHandler: app.authenticate }, async (request) => {
    const { buildId, categoryKey } = buildComponentParamsSchema.parse(request.params);
    return removeBuildComponent(app.db, buildId, request.user.sub, categoryKey);
  });

  app.post("/builds/:buildId/duplicate", { preHandler: app.authenticate }, async (request) => {
    const { buildId } = buildIdParamsSchema.parse(request.params);
    return duplicateBuild(app.db, buildId, request.user.sub);
  });

  app.get("/builds/:buildId/compatibility", { preHandler: app.authenticate }, async (request) => {
    const { buildId } = buildIdParamsSchema.parse(request.params);
    return getBuildCompatibilitySnapshot(app.db, buildId, request.user.sub);
  });

  app.get("/shared/builds/:buildId", async (request) => {
    const { buildId } = buildIdParamsSchema.parse(request.params);
    return getSharedBuildDetail(app.db, buildId);
  });
};

export default buildRoutes;
