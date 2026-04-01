import { User } from "../entities/User";
import { Address } from "../entities/Address";
import { Payment } from "../entities/Payment";
import { Order } from "../entities/Order";

export interface UserDashboard {
  profile: User;
  addresses: Address[];
  payments: Payment[];
  orders: Order[];
}

export interface UserRepositoryPort {
  findProfile(userId: string): Promise<User | null>;
  createProfile(user: User): Promise<void>;

  listAddresses(userId: string): Promise<Address[]>;
  addAddress(address: Address): Promise<void>;
  deleteAddress(userId: string, addressId: string): Promise<void>;

  listPayments(userId: string): Promise<Payment[]>;
  addPayment(payment: Payment): Promise<void>;
  deletePayment(userId: string, paymentId: string): Promise<void>;

  listOrders(userId: string): Promise<Order[]>;
  filterOrdersByStatus(userId: string, status: string): Promise<Order[]>;

  getDashboard(userId: string): Promise<UserDashboard | null>;
}
