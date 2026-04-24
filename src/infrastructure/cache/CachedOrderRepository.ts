import {
  OrderRepositoryPort,
  OrderDetail,
  CreateOrderInput,
} from "../../domain/ports/OrderRepositoryPort";
import { CachePort } from "../../domain/ports/CachePort";
import { Order } from "../../domain/entities/Order";
import { OrderItem } from "../../domain/entities/OrderItem";

/**
 * Decorador Cache-Aside para OrderRepositoryPort.
 *
 * Envuelve un repositorio real (e.g. DynamoDB) y antepone una capa
 * de caché.  Las LECTURAS buscan primero en caché; las ESCRITURAS
 * van directo al repositorio e invalidan las claves afectadas.
 */
export class CachedOrderRepository implements OrderRepositoryPort {
  constructor(
    private readonly delegate: OrderRepositoryPort,
    private readonly cache: CachePort,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  Helpers para construir claves de caché                            */
  /* ------------------------------------------------------------------ */

  private headerKey(orderId: string): string {
    return `order:header:${orderId}`;
  }
  private itemsKey(orderId: string): string {
    return `order:items:${orderId}`;
  }
  private detailKey(orderId: string): string {
    return `order:detail:${orderId}`;
  }

  /* ------------------------------------------------------------------ */
  /*  LECTURAS — Cache-Aside (Lazy Loading)                             */
  /* ------------------------------------------------------------------ */

  async getHeader(orderId: string): Promise<Order | null> {
    const key = this.headerKey(orderId);
    const cached = this.cache.get<Order | null>(key);
    if (cached !== undefined) return cached;

    const result = await this.delegate.getHeader(orderId);
    this.cache.set(key, result);
    return result;
  }

  async listItems(orderId: string): Promise<OrderItem[]> {
    const key = this.itemsKey(orderId);
    const cached = this.cache.get<OrderItem[]>(key);
    if (cached !== undefined) return cached;

    const result = await this.delegate.listItems(orderId);
    this.cache.set(key, result);
    return result;
  }

  async getFullDetail(orderId: string): Promise<OrderDetail | null> {
    const key = this.detailKey(orderId);
    const cached = this.cache.get<OrderDetail | null>(key);
    if (cached !== undefined) return cached;

    const result = await this.delegate.getFullDetail(orderId);
    this.cache.set(key, result);
    return result;
  }

  /* ------------------------------------------------------------------ */
  /*  ESCRITURAS — Delegate + Invalidación                              */
  /* ------------------------------------------------------------------ */

  async createOrder(input: CreateOrderInput): Promise<void> {
    await this.delegate.createOrder(input);

    // Invalidar caché de órdenes del usuario
    const userId = input.order.userId;
    this.cache.delByPrefix(`user:orders:${userId}`);
    this.cache.del(`user:dashboard:${userId}`);
  }

  async updateStatus(order: Order, newStatus: string): Promise<void> {
    await this.delegate.updateStatus(order, newStatus);

    // Invalidar caché de la orden
    this.cache.del(this.headerKey(order.orderId));
    this.cache.del(this.detailKey(order.orderId));

    // Invalidar caché de órdenes del usuario
    this.cache.delByPrefix(`user:orders:${order.userId}`);
    this.cache.del(`user:dashboard:${order.userId}`);
  }
}
