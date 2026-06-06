import { buildApp } from "./app.js";

const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_PORT = 3001;

async function startServer(): Promise<void> {
  const app = await buildApp();
  const host = process.env.HOST ?? DEFAULT_HOST;
  const port = Number(process.env.PORT ?? DEFAULT_PORT);

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
