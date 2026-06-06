import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { z } from "zod";

export const appEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().url().default("postgresql://postgres:postgres@localhost:5432/rotor"),
  JWT_SECRET: z.string().min(16).default("change-me-please-123"),
});

export type AppEnv = z.infer<typeof appEnvSchema>;

const envPlugin: FastifyPluginAsync = fp(async (app) => {
  const appEnv = appEnvSchema.parse(process.env);

  app.decorate("appEnv", appEnv);
});

export default envPlugin;
