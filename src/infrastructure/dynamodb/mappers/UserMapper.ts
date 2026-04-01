import { User } from "../../../domain/entities/User";
import { Address } from "../../../domain/entities/Address";
import { Payment } from "../../../domain/entities/Payment";

type DynamoItem = Record<string, unknown>;

export class UserMapper {
  static profileToDomain(item: DynamoItem): User {
    const userId = (item.PK as string).replace("USER#", "");
    return {
      userId,
      name: item.name as string,
      email: item.email as string,
    };
  }

  static addressToDomain(item: DynamoItem): Address {
    const userId = (item.PK as string).replace("USER#", "");
    const addressId = (item.SK as string).replace("ADDRESS#", "");
    return {
      addressId,
      userId,
      street: item.street as string,
      city: item.city as string,
    };
  }

  static paymentToDomain(item: DynamoItem): Payment {
    const userId = (item.PK as string).replace("USER#", "");
    const paymentId = (item.SK as string).replace("PAYMENT#", "");
    return {
      paymentId,
      userId,
      type: item.type as string,
      last4: item.last4 as string | undefined,
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
}
