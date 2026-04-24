import NodeCache from "node-cache";
import { CachePort } from "../../domain/ports/CachePort";

/**
 * Adaptador de caché en memoria usando node-cache.
 *
 * Implementa el puerto CachePort del dominio.  Es la ÚNICA clase que
 * conoce la librería node-cache; si se quiere migrar a Redis,
 * solo se reemplaza este archivo.
 */
export class InMemoryCacheAdapter implements CachePort {
  private readonly cache: NodeCache;

  constructor(defaultTtlSeconds: number = 300) {
    this.cache = new NodeCache({
      stdTTL: defaultTtlSeconds,
      checkperiod: Math.floor(defaultTtlSeconds * 0.2),
      useClones: true,
    });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    if (ttlSeconds !== undefined) {
      this.cache.set(key, value, ttlSeconds);
    } else {
      this.cache.set(key, value);
    }
  }

  del(key: string): void {
    this.cache.del(key);
  }

  delByPrefix(prefix: string): void {
    const keys = this.cache.keys().filter((k) => k.startsWith(prefix));
    if (keys.length > 0) {
      this.cache.del(keys);
    }
  }

  flush(): void {
    this.cache.flushAll();
  }

  /**
   * Retorna estadísticas del caché para diagnóstico.
   * No forma parte del puerto porque es específico de esta implementación.
   */
  getStats() {
    const stats = this.cache.getStats();
    return {
      hits: stats.hits,
      misses: stats.misses,
      keys: this.cache.keys().length,
      ksize: stats.ksize,
      vsize: stats.vsize,
    };
  }
}
