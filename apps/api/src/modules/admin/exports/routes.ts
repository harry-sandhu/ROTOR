import type { FastifyPluginAsync } from "fastify";

import { exportAdminProducts, exportAdminRules, exportAdminSpecifications } from "./service.js";

const adminExportRoutes: FastifyPluginAsync = async (app) => {
  app.get("/admin/export/products", { preHandler: app.requireRole("ADMIN") }, async () => {
    return exportAdminProducts(app.db);
  });

  app.get("/admin/export/specifications", { preHandler: app.requireRole("ADMIN") }, async () => {
    return exportAdminSpecifications(app.db);
  });

  app.get("/admin/export/rules", { preHandler: app.requireRole("ADMIN") }, async () => {
    return exportAdminRules(app.db);
  });
};

export default adminExportRoutes;
