import { createClient, RedisClientType } from "redis";
import { CachePort } from "../../domain/ports/CachePort";

/**
 * Adaptador Redis — implementa CachePort con estrategia fail-open:
 * si Redis falla, los errores se loggean y las operaciones devuelven
 * undefined / no-op para que la aplicación siga funcionando sin caché.
 */
export class RedisCacheAdapter implements CachePort {
  private readonly client: RedisClientType;

  constructor(
    redisUrl: string,
    private readonly defaultTtlSeconds: number = 300,
    private readonly keyPrefix: string = "app",
  ) {
    this.client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 5000),
      },
    });
    this.client.on("error", (err) => console.error("Redis error:", err));
  }

  async connect(): Promise<void> {
    if (this.client.isOpen) return;
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (!this.client.isOpen) return;
    await this.client.quit();
  }

  // Método de infraestructura — no forma parte de CachePort
  getStats(): { connected: boolean; keyPrefix: string } {
    return {
      connected: this.client.isOpen,
      keyPrefix: this.keyPrefix,
    };
  }

  private fullKey(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const data = await this.client.get(this.fullKey(key));
      return data === null ? undefined : (JSON.parse(data) as T);
    } catch (error) {
      console.error(`Redis GET "${key}":`, error);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const ttl = ttlSeconds ?? this.defaultTtlSeconds;
      await this.client.setEx(this.fullKey(key), ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Redis SET "${key}":`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(this.fullKey(key));
    } catch (error) {
      console.error(`Redis DEL "${key}":`, error);
    }
  }

  async delByPrefix(prefix: string): Promise<void> {
    try {
      await this.deleteMatching(`${this.fullKey(prefix)}*`);
    } catch (error) {
      console.error(`Redis DELBYPREFIX "${prefix}":`, error);
    }
  }

  async flush(): Promise<void> {
    try {
      await this.deleteMatching(`${this.keyPrefix}:*`);
    } catch (error) {
      console.error(`Redis FLUSH "${this.keyPrefix}:*":`, error);
    }
  }

  // Usa SCAN en lugar de KEYS para no bloquear Redis en producción.
  // scanIterator() en redis@5 itera por batches (array de strings por vuelta).
  private async deleteMatching(pattern: string): Promise<void> {
    try {
      for await (const keys of this.client.scanIterator({
        MATCH: pattern,
        COUNT: 100,
      })) {
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }
    } catch (error) {
      console.error(`Redis SCAN/DEL "${pattern}":`, error);
    }
  }
}
