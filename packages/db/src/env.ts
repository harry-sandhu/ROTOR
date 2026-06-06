import { z } from "zod";

export const dbEnvSchema = z.object({
  DATABASE_URL: z.string().url().default("postgresql://postgres:postgres@localhost:5432/rotor"),
});

export type DbEnv = z.infer<typeof dbEnvSchema>;

export function loadDbEnv(env: NodeJS.ProcessEnv = process.env): DbEnv {
  return dbEnvSchema.parse(env);
}
