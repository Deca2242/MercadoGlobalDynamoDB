import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { environment } from "./infrastructure/config/environment";
import { userController, orderController } from "./container";
import { createUserRoutes } from "./infrastructure/http/routes/userRoutes";
import { createOrderRoutes } from "./infrastructure/http/routes/orderRoutes";
import { errorHandler } from "./infrastructure/http/middlewares/errorHandler";
import { openApiSpec } from "./infrastructure/swagger";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger UI - Documentación de la API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Endpoint para obtener el spec OpenAPI en formato JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openApiSpec);
});

app.use("/api/users", createUserRoutes(userController));
app.use("/api/orders", createOrderRoutes(orderController));

app.use(errorHandler);

app.listen(environment.port, () => {
  console.log(`Server running on port ${environment.port}`);
});
