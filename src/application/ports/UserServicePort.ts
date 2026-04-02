import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";
import { Payment } from "../../domain/entities/Payment";
import { Order } from "../../domain/entities/Order";
import { UserDashboard } from "../../domain/ports/UserRepositoryPort";

export interface UserServicePort {
  getProfile(userId: string): Promise<User>;
  createProfile(name: string, email: string): Promise<string>;

  listAddresses(userId: string): Promise<Address[]>;
  addAddress(
    userId: string,
    addressId: string,
    street: string,
    city: string,
  ): Promise<void>;
  deleteAddress(userId: string, addressId: string): Promise<void>;

  listPayments(userId: string): Promise<Payment[]>;
  addPayment(
    userId: string,
    paymentId: string,
    type: string,
    last4?: string,
  ): Promise<void>;
  deletePayment(userId: string, paymentId: string): Promise<void>;

  listOrders(userId: string): Promise<Order[]>;
  filterOrdersByStatus(userId: string, status: string): Promise<Order[]>;

  getDashboard(userId: string): Promise<UserDashboard>;
}
