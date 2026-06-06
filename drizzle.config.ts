import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "drizzle-kit";

import { loadDbEnv } from "./packages/db/src/env.js";

const env = loadDbEnv();
const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  schema: resolve(rootDir, "packages/db/src/schema/index.ts"),
  out: resolve(rootDir, "packages/db/src/migrations"),
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
