import type { FastifyPluginAsync } from "fastify";

const envPlugin: FastifyPluginAsync = async () => {
  // Typed environment loading will be added in a later phase.
};

export default envPlugin;
