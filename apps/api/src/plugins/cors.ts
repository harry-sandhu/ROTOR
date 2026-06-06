import fastifyCors from "@fastify/cors";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";

const corsPlugin: FastifyPluginAsync = fp(async (app) => {
  await app.register(fastifyCors, {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      try {
        const url = new URL(origin);
        const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
        const isPrivateLan =
          url.hostname.startsWith("192.168.") ||
          url.hostname.startsWith("10.") ||
          /^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname);

        if (url.protocol === "http:" && url.port === "3000" && (isLocalhost || isPrivateLan)) {
          callback(null, true);
          return;
        }
      } catch {
        callback(null, false);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
});

export default corsPlugin;
