import express from "express";
import cors from "cors";
import { environment } from "./infrastructure/config/environment";
import { userController, orderController } from "./container";
import { createUserRoutes } from "./infrastructure/http/routes/userRoutes";
import { createOrderRoutes } from "./infrastructure/http/routes/orderRoutes";
import { errorHandler } from "./infrastructure/http/middlewares/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", createUserRoutes(userController));
app.use("/api/orders", createOrderRoutes(orderController));

app.use(errorHandler);

app.listen(environment.port, () => {
  console.log(`Server running on port ${environment.port}`);
});
