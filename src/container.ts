import { createDynamoDBDocClient } from "./infrastructure/dynamodb/DynamoDBClient";
import { environment } from "./infrastructure/config/environment";
import { DynamoDBUserRepository } from "./infrastructure/dynamodb/DynamoDBUserRepository";
import { DynamoDBOrderRepository } from "./infrastructure/dynamodb/DynamoDBOrderRepository";
import { RedisCacheAdapter } from "./infrastructure/cache/RedisCacheAdapter";
import { CachedUserRepository } from "./infrastructure/cache/CachedUserRepository";
import { CachedOrderRepository } from "./infrastructure/cache/CachedOrderRepository";
import { UserService } from "./application/services/UserService";
import { OrderService } from "./application/services/OrderService";
import { UserController } from "./infrastructure/http/controllers/UserController";
import { OrderController } from "./infrastructure/http/controllers/OrderController";

const docClient = createDynamoDBDocClient();
const dynamoUserRepo = new DynamoDBUserRepository(docClient, environment.tableName);
const dynamoOrderRepo = new DynamoDBOrderRepository(docClient, environment.tableName);

export const cacheAdapter = new RedisCacheAdapter(
  environment.cache.redisUrl,
  environment.cache.ttlSeconds,
  environment.cache.redisKeyPrefix,
);

console.log(
  environment.cache.enabled
    ? `Caché Redis: ${environment.cache.redisUrl}`
    : "Caché: desactivada",
);

export async function connectCache(): Promise<void> {
  if (environment.cache.enabled) {
    await cacheAdapter.connect();
  }
}

export async function disconnectCache(): Promise<void> {
  if (environment.cache.enabled) {
    await cacheAdapter.disconnect();
  }
}

const userRepo = environment.cache.enabled
  ? new CachedUserRepository(dynamoUserRepo, cacheAdapter)
  : dynamoUserRepo;

const orderRepo = environment.cache.enabled
  ? new CachedOrderRepository(dynamoOrderRepo, cacheAdapter)
  : dynamoOrderRepo;

const userService = new UserService(userRepo);
const orderService = new OrderService(orderRepo);

export const userController = new UserController(userService);
export const orderController = new OrderController(orderService);
