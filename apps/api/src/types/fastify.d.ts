import "@fastify/jwt";
import "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import type { DbClient } from "@rotor/db";
import type { AppEnv } from "../plugins/env.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      sub: string;
      email: string;
      role: "USER" | "ADMIN";
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    appEnv: AppEnv;
    db: DbClient;
    dbPool: Pool;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (role: "USER" | "ADMIN") => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
