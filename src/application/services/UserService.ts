import { v4 as uuidv4 } from "uuid";
import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";
import { Payment } from "../../domain/entities/Payment";
import { Order } from "../../domain/entities/Order";
import {
  UserRepositoryPort,
  UserDashboard,
} from "../../domain/ports/UserRepositoryPort";
import { NotFoundError } from "../../shared/AppError";
import { validate } from "../../shared/validation";
import {
  CreateProfileSchema,
  AddAddressSchema,
  AddPaymentSchema,
  FilterOrdersSchema,
} from "../validators/UserValidator";

export class UserService {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepo.findProfile(userId);
    if (!user) throw new NotFoundError(`User '${userId}'`);
    return user;
  }

  async createProfile(
    name: string,
    email: string,
  ): Promise<string> {
    validate(CreateProfileSchema, { name, email });

    const userId = uuidv4();
    
    await this.userRepo.createProfile({ userId, name, email });
    return userId;
  }

  async listAddresses(userId: string): Promise<Address[]> {
    return this.userRepo.listAddresses(userId);
  }

  async addAddress(
    userId: string,
    addressId: string,
    street: string,
    city: string,
  ): Promise<void> {
    validate(AddAddressSchema, { addressId, userId, street, city });
    await this.userRepo.addAddress({ addressId, userId, street, city });
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.userRepo.deleteAddress(userId, addressId);
  }

  async listPayments(userId: string): Promise<Payment[]> {
    return this.userRepo.listPayments(userId);
  }

  async addPayment(
    userId: string,
    type: string,
    last4?: string,
  ): Promise<void> {
    validate(AddPaymentSchema, { userId, type, last4 });
    const paymentId = uuidv4();
    await this.userRepo.addPayment({ paymentId, userId, type, last4 });
  }

  async deletePayment(userId: string, paymentId: string): Promise<void> {
    await this.userRepo.deletePayment(userId, paymentId);
  }

  async listOrders(userId: string): Promise<Order[]> {
    return this.userRepo.listOrders(userId);
  }

  async filterOrdersByStatus(
    userId: string,
    status: string,
  ): Promise<Order[]> {
    const { status: validatedStatus } = validate(FilterOrdersSchema, {
      status,
    });
    return this.userRepo.filterOrdersByStatus(userId, validatedStatus);
  }

  async getDashboard(userId: string): Promise<UserDashboard> {
    const dashboard = await this.userRepo.getDashboard(userId);
    if (!dashboard) throw new NotFoundError(`User '${userId}'`);
    return dashboard;
  }
}
