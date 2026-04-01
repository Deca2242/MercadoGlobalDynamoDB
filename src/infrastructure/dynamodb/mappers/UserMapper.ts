import { User } from "../../../domain/entities/User";
import { Address } from "../../../domain/entities/Address";
import { Payment } from "../../../domain/entities/Payment";
import { Order } from "../../../domain/entities/Order";

type DynamoItem = Record<string, any>;

export class UserMapper {
  static profileToDomain(item: DynamoItem): User {
    const userId = (item.PK as string).replace("USER#", "");
    return {
      userId,
      name: item.name,
      email: item.email,
    };
  }

  static addressToDomain(item: DynamoItem): Address {
    const userId = (item.PK as string).replace("USER#", "");
    const addressId = (item.SK as string).replace("ADDRESS#", "");
    return {
      addressId,
      userId,
      street: item.street,
      city: item.city,
    };
  }

  static paymentToDomain(item: DynamoItem): Payment {
    const userId = (item.PK as string).replace("USER#", "");
    const paymentId = (item.SK as string).replace("PAYMENT#", "");
    return {
      paymentId,
      userId,
      type: item.type,
      last4: item.last4,
    };
  }

  static orderRefToDomain(item: DynamoItem): Order {
    const userId = (item.PK as string).replace("USER#", "");
    return {
      orderId: item.orderId,
      userId,
      status: item.status,
      total: Number(item.total),
      date: item.GSI1SK || "",
      shippingAddress: item.shippingAddress || "",
    };
  }

  static profileToDynamo(user: User): DynamoItem {
    return {
      PK: `USER#${user.userId}`,
      SK: "#PROFILE",
      name: user.name,
      email: user.email,
    };
  }

  static addressToDynamo(address: Address): DynamoItem {
    return {
      PK: `USER#${address.userId}`,
      SK: `ADDRESS#${address.addressId}`,
      street: address.street,
      city: address.city,
    };
  }

  static paymentToDynamo(payment: Payment): DynamoItem {
    return {
      PK: `USER#${payment.userId}`,
      SK: `PAYMENT#${payment.paymentId}`,
      type: payment.type,
      ...(payment.last4 && { last4: payment.last4 }),
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
