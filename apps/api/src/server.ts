import { buildApp } from "./app.js";

async function startServer(): Promise<void> {
  const app = await buildApp();
  const { HOST: host, PORT: port } = app.appEnv;

  const shutdown = async (): Promise<void> => {
    app.log.info("Shutting down API server...");
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });

  process.on("SIGTERM", () => {
    void shutdown();
  });

  try {
    await app.listen({
      host,
      port,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void startServer();
