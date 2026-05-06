import {
  OrderRepositoryPort,
  OrderDetail,
  CreateOrderInput,
} from "../../domain/ports/OrderRepositoryPort";
import { CachePort } from "../../domain/ports/CachePort";
import { Order } from "../../domain/entities/Order";
import { OrderItem } from "../../domain/entities/OrderItem";

export class CachedOrderRepository implements OrderRepositoryPort {
  constructor(
    private readonly delegate: OrderRepositoryPort,
    private readonly cache: CachePort,
  ) {}

  private headerKey(orderId: string): string {
    return `order:header:${orderId}`;
  }
  private itemsKey(orderId: string): string {
    return `order:items:${orderId}`;
  }
  private detailKey(orderId: string): string {
    return `order:detail:${orderId}`;
  }

  async getHeader(orderId: string): Promise<Order | null> {
    const key = this.headerKey(orderId);
    const cached = await this.cache.get<Order | null>(key);
    if (cached !== undefined) return cached as Order | null;

    const result = await this.delegate.getHeader(orderId);
    await this.cache.set(key, result);
    return result;
  }

  async listItems(orderId: string): Promise<OrderItem[]> {
    const key = this.itemsKey(orderId);
    const cached = await this.cache.get<OrderItem[]>(key);
    if (cached !== undefined) return cached as OrderItem[];

    const result = await this.delegate.listItems(orderId);
    await this.cache.set(key, result);
    return result;
  }

  async getFullDetail(orderId: string): Promise<OrderDetail | null> {
    const key = this.detailKey(orderId);
    const cached = await this.cache.get<OrderDetail | null>(key);
    if (cached !== undefined) return cached as OrderDetail | null;

    const result = await this.delegate.getFullDetail(orderId);
    await this.cache.set(key, result);
    return result;
  }

  async createOrder(input: CreateOrderInput): Promise<void> {
    await this.delegate.createOrder(input);
    const { userId } = input.order;
    await this.cache.delByPrefix(`user:orders:${userId}`);
    await this.cache.del(`user:dashboard:${userId}`);
  }

  async updateStatus(order: Order, newStatus: string): Promise<void> {
    await this.delegate.updateStatus(order, newStatus);
    await this.cache.del(this.headerKey(order.orderId));
    await this.cache.del(this.detailKey(order.orderId));
    await this.cache.delByPrefix(`user:orders:${order.userId}`);
    await this.cache.del(`user:dashboard:${order.userId}`);
  }
}
