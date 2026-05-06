import dotenv from "dotenv";

dotenv.config();

function parseTtl(raw: string | undefined, fallback: number): number {
  const parsed = parseInt(raw ?? String(fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const environment = {
  port: parseInt(process.env.PORT || "3000", 10),

  dynamodb: {
    endpoint: process.env.DYNAMO_ENDPOINT || "http://localhost:8000",
    region: process.env.DYNAMO_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "fakeMyKeyId",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "fakeSecretAccessKey",
  },

  tableName: process.env.TABLE_NAME || "MercadoGlobal",

  cache: {
    enabled: process.env.CACHE_ENABLED !== "false",
    ttlSeconds: parseTtl(process.env.CACHE_TTL_SECONDS, 300),
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
    redisKeyPrefix: process.env.REDIS_KEY_PREFIX || "mercadoglobal",
  },
};
