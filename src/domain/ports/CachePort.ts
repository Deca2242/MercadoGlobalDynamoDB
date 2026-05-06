/**
 * Puerto de caché del dominio.
 *
 * Define las operaciones que cualquier adaptador de caché
 * (Redis, Memcached, in-memory, etc.) debe implementar.
 */
export interface CachePort {

  /** Obtiene un valor del caché. Retorna `undefined` si no existe o hay error. */
  get<T>(key: string): Promise<T | undefined>;

  /** Almacena un valor con TTL opcional (en segundos). */
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;

  /** Elimina una clave específica. */
  del(key: string): Promise<void>;

  /** Elimina todas las claves que comienzan con el prefijo dado. */
  delByPrefix(prefix: string): Promise<void>;

  /** Elimina todas las claves del namespace de la aplicación. */
  flush(): Promise<void>;
}
