import { createDynamoDBDocClient } from "./infrastructure/dynamodb/DynamoDBClient";
import { environment } from "./infrastructure/config/environment";
import { DynamoDBUserRepository } from "./infrastructure/dynamodb/DynamoDBUserRepository";
import { DynamoDBOrderRepository } from "./infrastructure/dynamodb/DynamoDBOrderRepository";
import { UserService } from "./application/services/UserService";
import { OrderService } from "./application/services/OrderService";
import { UserController } from "./infrastructure/http/controllers/UserController";
import { OrderController } from "./infrastructure/http/controllers/OrderController";

const docClient = createDynamoDBDocClient();

const userRepo = new DynamoDBUserRepository(docClient, environment.tableName);
const orderRepo = new DynamoDBOrderRepository(docClient, environment.tableName);

export const userService = new UserService(userRepo);
export const orderService = new OrderService(orderRepo);

export const userController = new UserController(userService);
export const orderController = new OrderController(orderService);
