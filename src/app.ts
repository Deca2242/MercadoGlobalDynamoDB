import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { environment } from "./infrastructure/config/environment";
import {
  userController,
  orderController,
  cacheAdapter,
  connectCache,
  disconnectCache,
} from "./container";
import { createUserRoutes } from "./infrastructure/http/routes/userRoutes";
import { createOrderRoutes } from "./infrastructure/http/routes/orderRoutes";
import { errorHandler } from "./infrastructure/http/middlewares/errorHandler";
import { openApiSpec } from "./infrastructure/swagger";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openApiSpec);
});

app.use("/api/users", createUserRoutes(userController));
app.use("/api/orders", createOrderRoutes(orderController));

app.get("/api/cache/stats", (_req, res) => {
  res.json({
    enabled: environment.cache.enabled,
    type: "redis",
    ttlSeconds: environment.cache.ttlSeconds,
    ...cacheAdapter.getStats(),
  });
});

app.use(errorHandler);

async function shutdown(signal: string): Promise<void> {
  console.log(`${signal} recibido — cerrando la aplicación...`);
  await disconnectCache();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

async function main(): Promise<void> {
  await connectCache();
  app.listen(environment.port, () => {
    console.log(`Servidor iniciado en el puerto ${environment.port}`);
  });
}

main().catch((error) => {
  console.error("Error fatal al iniciar la aplicación:", error);
  process.exit(1);
});
