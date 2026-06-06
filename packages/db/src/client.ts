import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema/index.js";

export function createDbPool(connectionString: string): Pool {
  return new Pool({ connectionString });
}

export function createDbClient(connectionString: string) {
  const pool = createDbPool(connectionString);

  return drizzle(pool, { schema });
}

export function createDbConnection(connectionString: string) {
  const pool = createDbPool(connectionString);
  const db = drizzle(pool, { schema });

  return { db, pool };
}

export type DbClient = ReturnType<typeof createDbClient>;
