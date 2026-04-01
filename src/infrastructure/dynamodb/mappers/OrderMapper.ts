import { Order } from "../../../domain/entities/Order";
import { OrderItem } from "../../../domain/entities/OrderItem";

type DynamoItem = Record<string, unknown>;

export class OrderMapper {
  static metadataToDomain(item: DynamoItem): Order {
    const orderId = (item.PK as string).replace("ORDER#", "");
    return {
      orderId,
      userId: (item.userId as string).replace("USER#", ""),
      status: item.status as string,
      total: Number(item.total),
      date: (item.date as string) || "",
      shippingAddress: (item.shippingAddress as string) || "",
    };
  }

  static itemToDomain(item: DynamoItem): OrderItem {
    const orderId = (item.PK as string).replace("ORDER#", "");
    const productSlug = (item.SK as string).replace("ITEM#", "");
    return {
      orderId,
      productSlug,
      productName: item.productName as string,
      qty: Number(item.qty),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    };
  }

  static orderRefToDomain(item: DynamoItem): Order {
    const userId = (item.PK as string).replace("USER#", "");
    return {
      orderId: item.orderId as string,
      userId,
      status: item.status as string,
      total: Number(item.total),
      date: (item.GSI1SK as string) || "",
      shippingAddress: (item.shippingAddress as string) || "",
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

  static orderRefToDynamo(order: Order): DynamoItem {
    const datePrefix = order.date.substring(0, 19) + "Z";
    return {
      PK: `USER#${order.userId}`,
      SK: `ORDER#${datePrefix}#${order.orderId}`,
      orderId: order.orderId,
      status: order.status,
      total: order.total,
      shippingAddress: order.shippingAddress,
      GSI1PK: `USER#${order.userId}#STATUS#${order.status}`,
      GSI1SK: datePrefix,
    };
  }
}
