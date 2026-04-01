import { Order } from "../../../domain/entities/Order";
import { OrderItem } from "../../../domain/entities/OrderItem";

type DynamoItem = Record<string, any>;

export class OrderMapper {
  static metadataToDomain(item: DynamoItem): Order {
    const orderId = (item.PK as string).replace("ORDER#", "");
    return {
      orderId,
      userId: (item.userId as string).replace("USER#", ""),
      status: item.status,
      total: Number(item.total),
      date: item.date || "",
      shippingAddress: item.shippingAddress || "",
    };
  }

  static itemToDomain(item: DynamoItem): OrderItem {
    const orderId = (item.PK as string).replace("ORDER#", "");
    const productSlug = (item.SK as string).replace("ITEM#", "");
    return {
      orderId,
      productSlug,
      productName: item.productName,
      qty: Number(item.qty),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    };
  }

  static metadataToDynamo(order: Order): DynamoItem {
    return {
      PK: `ORDER#${order.orderId}`,
      SK: "#METADATA",
      userId: `USER#${order.userId}`,
      status: order.status,
      total: order.total,
      date: order.date,
      shippingAddress: order.shippingAddress,
    };
  }

  static itemToDynamo(item: OrderItem): DynamoItem {
    return {
      PK: `ORDER#${item.orderId}`,
      SK: `ITEM#${item.productSlug}`,
      productName: item.productName,
      qty: item.qty,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    };
  }
}
