import "fastify";
import type { AppEnv } from "../plugins/env.js";

declare module "fastify" {
  interface FastifyInstance {
    appEnv: AppEnv;
  }
}
