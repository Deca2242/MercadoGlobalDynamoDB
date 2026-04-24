import {
  UserRepositoryPort,
  UserDashboard,
} from "../../domain/ports/UserRepositoryPort";
import { CachePort } from "../../domain/ports/CachePort";
import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";
import { Payment } from "../../domain/entities/Payment";
import { Order } from "../../domain/entities/Order";

/**
 * Decorador Cache-Aside para UserRepositoryPort.
 *
 * Envuelve un repositorio real (e.g. DynamoDB) y antepone una capa
 * de caché.  Las LECTURAS buscan primero en caché; las ESCRITURAS
 * van directo al repositorio e invalidan las claves afectadas.
 */
export class CachedUserRepository implements UserRepositoryPort {
  constructor(
    private readonly delegate: UserRepositoryPort,
    private readonly cache: CachePort,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  Helpers para construir claves de caché                            */
  /* ------------------------------------------------------------------ */

  private profileKey(userId: string): string {
    return `user:profile:${userId}`;
  }
  private addressesKey(userId: string): string {
    return `user:addresses:${userId}`;
  }
  private paymentsKey(userId: string): string {
    return `user:payments:${userId}`;
  }
  private ordersKey(userId: string): string {
    return `user:orders:${userId}`;
  }
  private ordersByStatusKey(userId: string, status: string): string {
    return `user:orders:${userId}:status:${status}`;
  }
  private dashboardKey(userId: string): string {
    return `user:dashboard:${userId}`;
  }

  /* ------------------------------------------------------------------ */
  /*  LECTURAS — Cache-Aside (Lazy Loading)                             */
  /* ------------------------------------------------------------------ */

  async findProfile(userId: string): Promise<User | null> {
    const key = this.profileKey(userId);
    const cached = this.cache.get<User | null>(key);
    if (cached !== undefined) return cached;

    const result = await this.delegate.findProfile(userId);
    this.cache.set(key, result);
    return result;
  }

  async listAddresses(userId: string): Promise<Address[]> {
    const key = this.addressesKey(userId);
    const cached = this.cache.get<Address[]>(key);
    if (cached !== undefined) return cached;

    const result = await this.delegate.listAddresses(userId);
    this.cache.set(key, result);
    return result;
  }

  async listPayments(userId: string): Promise<Payment[]> {
    const key = this.paymentsKey(userId);
    const cached = this.cache.get<Payment[]>(key);
    if (cached !== undefined) return cached;

    const result = await this.delegate.listPayments(userId);
    this.cache.set(key, result);
    return result;
  }

  async listOrders(userId: string): Promise<Order[]> {
    const key = this.ordersKey(userId);
    const cached = this.cache.get<Order[]>(key);
    if (cached !== undefined) return cached;

    const result = await this.delegate.listOrders(userId);
    this.cache.set(key, result);
    return result;
  }

  async filterOrdersByStatus(
    userId: string,
    status: string,
  ): Promise<Order[]> {
    const key = this.ordersByStatusKey(userId, status);
    const cached = this.cache.get<Order[]>(key);
    if (cached !== undefined) return cached;

    const result = await this.delegate.filterOrdersByStatus(userId, status);
    this.cache.set(key, result);
    return result;
  }

  async getDashboard(userId: string): Promise<UserDashboard | null> {
    const key = this.dashboardKey(userId);
    const cached = this.cache.get<UserDashboard | null>(key);
    if (cached !== undefined) return cached;

    const result = await this.delegate.getDashboard(userId);
    this.cache.set(key, result);
    return result;
  }

  /* ------------------------------------------------------------------ */
  /*  ESCRITURAS — Delegate + Invalidación                              */
  /* ------------------------------------------------------------------ */

  async createProfile(user: User): Promise<void> {
    await this.delegate.createProfile(user);
    this.cache.del(this.profileKey(user.userId));
    this.cache.del(this.dashboardKey(user.userId));
  }

  async addAddress(address: Address): Promise<void> {
    await this.delegate.addAddress(address);
    this.cache.del(this.addressesKey(address.userId));
    this.cache.del(this.dashboardKey(address.userId));
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.delegate.deleteAddress(userId, addressId);
    this.cache.del(this.addressesKey(userId));
    this.cache.del(this.dashboardKey(userId));
  }

  async addPayment(payment: Payment): Promise<void> {
    await this.delegate.addPayment(payment);
    this.cache.del(this.paymentsKey(payment.userId));
    this.cache.del(this.dashboardKey(payment.userId));
  }

  async deletePayment(userId: string, paymentId: string): Promise<void> {
    await this.delegate.deletePayment(userId, paymentId);
    this.cache.del(this.paymentsKey(userId));
    this.cache.del(this.dashboardKey(userId));
  }
}
