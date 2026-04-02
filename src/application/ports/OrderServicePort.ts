import { Order } from "../../domain/entities/Order";
import { OrderItem } from "../../domain/entities/OrderItem";
import { OrderDetail } from "../../domain/ports/OrderRepositoryPort";

export interface OrderServicePort {
  getHeader(orderId: string): Promise<Order>;
  listItems(orderId: string): Promise<OrderItem[]>;
  getFullDetail(orderId: string): Promise<OrderDetail>;
  createOrder(order: Order, items: OrderItem[]): Promise<void>;
  updateStatus(orderId: string, newStatus: string): Promise<void>;
}
