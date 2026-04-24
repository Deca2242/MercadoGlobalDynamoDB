import { createDynamoDBDocClient } from "./infrastructure/dynamodb/DynamoDBClient";
import { environment } from "./infrastructure/config/environment";
import { DynamoDBUserRepository } from "./infrastructure/dynamodb/DynamoDBUserRepository";
import { DynamoDBOrderRepository } from "./infrastructure/dynamodb/DynamoDBOrderRepository";
import { InMemoryCacheAdapter } from "./infrastructure/cache/InMemoryCacheAdapter";
import { CachedUserRepository } from "./infrastructure/cache/CachedUserRepository";
import { CachedOrderRepository } from "./infrastructure/cache/CachedOrderRepository";
import { UserService } from "./application/services/UserService";
import { OrderService } from "./application/services/OrderService";
import { UserController } from "./infrastructure/http/controllers/UserController";
import { OrderController } from "./infrastructure/http/controllers/OrderController";

const docClient = createDynamoDBDocClient();

// Adaptadores de salida — DynamoDB (repositorios reales)
const dynamoUserRepo = new DynamoDBUserRepository(docClient, environment.tableName);
const dynamoOrderRepo = new DynamoDBOrderRepository(docClient, environment.tableName);

// Cache-Aside: envuelve los repos DynamoDB con caché en memoria
const cacheAdapter = new InMemoryCacheAdapter(environment.cache.ttlSeconds);

const userRepo = environment.cache.enabled
  ? new CachedUserRepository(dynamoUserRepo, cacheAdapter)
  : dynamoUserRepo;

const orderRepo = environment.cache.enabled
  ? new CachedOrderRepository(dynamoOrderRepo, cacheAdapter)
  : dynamoOrderRepo;

// Servicios (reciben los puertos, no clases concretas)
const userService = new UserService(userRepo);
const orderService = new OrderService(orderRepo);

// Adaptadores de entrada
export const userController = new UserController(userService);
export const orderController = new OrderController(orderService);

// Exportar cacheAdapter para el endpoint de diagnóstico
export { cacheAdapter };
