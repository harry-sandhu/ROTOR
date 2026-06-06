import { defineConfig } from "drizzle-kit";

import { loadDbEnv } from "./packages/db/src/env.js";

const env = loadDbEnv();

export default defineConfig({
  schema: "./packages/db/src/schema/index.ts",
  out: "./packages/db/src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
