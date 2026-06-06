import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

import { createDbConnection } from "@rotor/db";

const dbPlugin: FastifyPluginAsync = fp(async (app) => {
  const { db, pool } = createDbConnection(app.appEnv.DATABASE_URL);

  app.decorate("db", db);
  app.decorate("dbPool", pool);

  app.addHook("onClose", async () => {
    await pool.end();
  });
});

export default dbPlugin;
