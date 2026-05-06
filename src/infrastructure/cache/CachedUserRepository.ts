import {
  UserRepositoryPort,
  UserDashboard,
} from "../../domain/ports/UserRepositoryPort";
import { CachePort } from "../../domain/ports/CachePort";
import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";
import { Payment } from "../../domain/entities/Payment";
import { Order } from "../../domain/entities/Order";

export class CachedUserRepository implements UserRepositoryPort {
  constructor(
    private readonly delegate: UserRepositoryPort,
    private readonly cache: CachePort,
  ) {}

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

  async findProfile(userId: string): Promise<User | null> {
    const key = this.profileKey(userId);
    const cached = await this.cache.get<User | null>(key);
    if (cached !== undefined) return cached as User | null;

    const result = await this.delegate.findProfile(userId);
    await this.cache.set(key, result);
    return result;
  }

  async listAddresses(userId: string): Promise<Address[]> {
    const key = this.addressesKey(userId);
    const cached = await this.cache.get<Address[]>(key);
    if (cached !== undefined) return cached as Address[];

    const result = await this.delegate.listAddresses(userId);
    await this.cache.set(key, result);
    return result;
  }

  async listPayments(userId: string): Promise<Payment[]> {
    const key = this.paymentsKey(userId);
    const cached = await this.cache.get<Payment[]>(key);
    if (cached !== undefined) return cached as Payment[];

    const result = await this.delegate.listPayments(userId);
    await this.cache.set(key, result);
    return result;
  }

  async listOrders(userId: string): Promise<Order[]> {
    const key = this.ordersKey(userId);
    const cached = await this.cache.get<Order[]>(key);
    if (cached !== undefined) return cached as Order[];

    const result = await this.delegate.listOrders(userId);
    await this.cache.set(key, result);
    return result;
  }

  async filterOrdersByStatus(userId: string, status: string): Promise<Order[]> {
    const key = this.ordersByStatusKey(userId, status);
    const cached = await this.cache.get<Order[]>(key);
    if (cached !== undefined) return cached as Order[];

    const result = await this.delegate.filterOrdersByStatus(userId, status);
    await this.cache.set(key, result);
    return result;
  }

  async getDashboard(userId: string): Promise<UserDashboard | null> {
    const key = this.dashboardKey(userId);
    const cached = await this.cache.get<UserDashboard | null>(key);
    if (cached !== undefined) return cached as UserDashboard | null;

    const result = await this.delegate.getDashboard(userId);
    await this.cache.set(key, result);
    return result;
  }

  async createProfile(user: User): Promise<void> {
    await this.delegate.createProfile(user);
    await this.cache.del(this.profileKey(user.userId));
    await this.cache.del(this.dashboardKey(user.userId));
  }

  async addAddress(address: Address): Promise<void> {
    await this.delegate.addAddress(address);
    await this.cache.del(this.addressesKey(address.userId));
    await this.cache.del(this.dashboardKey(address.userId));
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.delegate.deleteAddress(userId, addressId);
    await this.cache.del(this.addressesKey(userId));
    await this.cache.del(this.dashboardKey(userId));
  }

  async addPayment(payment: Payment): Promise<void> {
    await this.delegate.addPayment(payment);
    await this.cache.del(this.paymentsKey(payment.userId));
    await this.cache.del(this.dashboardKey(payment.userId));
  }

  async deletePayment(userId: string, paymentId: string): Promise<void> {
    await this.delegate.deletePayment(userId, paymentId);
    await this.cache.del(this.paymentsKey(userId));
    await this.cache.del(this.dashboardKey(userId));
  }
}
