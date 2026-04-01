import { Order } from "../../domain/entities/Order";
import { OrderItem } from "../../domain/entities/OrderItem";
import { NotFoundError } from "../../shared/AppError";
import { validate } from "../../shared/validation";
import {
  OrderRepositoryPort,
  OrderDetail,
  CreateOrderInput,
} from "../../domain/ports/OrderRepositoryPort";
import { OrderServicePort } from "../ports/OrderServicePort";
import {
  CreateOrderInputSchema,
  UpdateStatusSchema,
} from "../validators/OrderValidator";

export class OrderService implements OrderServicePort {
  constructor(private readonly orderRepo: OrderRepositoryPort) {}

  async getHeader(orderId: string): Promise<Order> {
    const order = await this.orderRepo.getHeader(orderId);
    if (!order) throw new NotFoundError(`Order '${orderId}'`);
    return order;
  }

  async listItems(orderId: string): Promise<OrderItem[]> {
    return this.orderRepo.listItems(orderId);
  }

  async getFullDetail(orderId: string): Promise<OrderDetail> {
    const detail = await this.orderRepo.getFullDetail(orderId);
    if (!detail) throw new NotFoundError(`Order '${orderId}'`);
    return detail;
  }

  async createOrder(order: Order, items: OrderItem[]): Promise<void> {
    const validated = validate(CreateOrderInputSchema, { order, items });

    const fullItems: OrderItem[] = validated.items.map((item) => ({
      ...item,
      orderId: order.orderId,
      subtotal: item.qty * item.unitPrice,
    }));

    const total = fullItems.reduce((sum, item) => sum + item.subtotal, 0);

    const input: CreateOrderInput = {
      order: { ...validated.order, total, date: new Date().toISOString() },
      items: fullItems,
    };

    await this.orderRepo.createOrder(input);
  }

  async updateStatus(orderId: string, newStatus: string): Promise<void> {
    const order = await this.getHeader(orderId);
    const { newStatus: status } = validate(UpdateStatusSchema, { newStatus });
    await this.orderRepo.updateStatus(order, status);
  }
}
