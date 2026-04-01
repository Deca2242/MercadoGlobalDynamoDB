import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";

export interface OrderDetail {
  order: Order;
  items: OrderItem[];
}

export interface CreateOrderInput {
  order: Order;
  items: OrderItem[];
}

export interface OrderRepositoryPort {
  getHeader(orderId: string): Promise<Order | null>;
  listItems(orderId: string): Promise<OrderItem[]>;
  getFullDetail(orderId: string): Promise<OrderDetail | null>;

  createOrder(input: CreateOrderInput): Promise<void>;

  updateStatus(
    orderId: string,
    userId: string,
    newStatus: string,
  ): Promise<void>;
}
