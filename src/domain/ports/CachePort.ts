/**
 * Puerto genérico de caché.
 *
 * Define las operaciones que cualquier implementación de caché debe
 * ofrecer.  El dominio y la capa de aplicación dependen de esta
 * interfaz, NUNCA de una librería concreta (node-cache, Redis, etc.).
 */
export interface CachePort {
  /** Obtiene un valor del caché. Retorna `undefined` si no existe o expiró. */
  get<T>(key: string): T | undefined;

  /** Almacena un valor en el caché con TTL opcional (en segundos). */
  set<T>(key: string, value: T, ttlSeconds?: number): void;

  /** Elimina una clave específica del caché. */
  del(key: string): void;

  /**
   * Elimina todas las claves que empiezan con el prefijo dado.
   * Útil para invalidar grupos de datos relacionados
   * (e.g. todas las direcciones de un usuario).
   */
  delByPrefix(prefix: string): void;

  /** Vacía todo el caché. */
  flush(): void;
}
