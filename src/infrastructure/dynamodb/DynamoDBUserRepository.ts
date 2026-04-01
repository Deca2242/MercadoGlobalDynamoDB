import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  UserRepositoryPort,
  UserDashboard,
} from "../../domain/ports/UserRepositoryPort";
import { User } from "../../domain/entities/User";
import { Address } from "../../domain/entities/Address";
import { Payment } from "../../domain/entities/Payment";
import { Order } from "../../domain/entities/Order";
import { UserMapper } from "./mappers/UserMapper";
import { OrderMapper } from "./mappers/OrderMapper";

export class DynamoDBUserRepository implements UserRepositoryPort {
  constructor(
    private readonly docClient: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  async findProfile(userId: string): Promise<User | null> {
    const { Item } = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `USER#${userId}`, SK: "#PROFILE" },
      }),
    );
    return Item ? UserMapper.profileToDomain(Item) : null;
  }

  async createProfile(user: User): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: UserMapper.profileToDynamo(user),
      }),
    );
  }

  async listAddresses(userId: string): Promise<Address[]> {
    const { Items = [] } = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":prefix": "ADDRESS#",
        },
      }),
    );
    return Items.map(UserMapper.addressToDomain);
  }

  async addAddress(address: Address): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: UserMapper.addressToDynamo(address),
      }),
    );
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { PK: `USER#${userId}`, SK: `ADDRESS#${addressId}` },
      }),
    );
  }

  async listPayments(userId: string): Promise<Payment[]> {
    const { Items = [] } = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":prefix": "PAYMENT#",
        },
      }),
    );
    return Items.map(UserMapper.paymentToDomain);
  }

  async addPayment(payment: Payment): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: UserMapper.paymentToDynamo(payment),
      }),
    );
  }

  async deletePayment(userId: string, paymentId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { PK: `USER#${userId}`, SK: `PAYMENT#${paymentId}` },
      }),
    );
  }

  async listOrders(userId: string): Promise<Order[]> {
    const { Items = [] } = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":prefix": "ORDER#",
        },
        ScanIndexForward: false,
      }),
    );
    return Items.map(OrderMapper.orderRefToDomain);
  }

  async filterOrdersByStatus(
    userId: string,
    status: string,
  ): Promise<Order[]> {
    const { Items = [] } = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "GSI1-UserStatus-Date",
        KeyConditionExpression: "GSI1PK = :gsi1pk",
        ExpressionAttributeValues: {
          ":gsi1pk": `USER#${userId}#STATUS#${status}`,
        },
        ScanIndexForward: false,
      }),
    );
    return Items.map(OrderMapper.orderRefToDomain);
  }

  async getDashboard(userId: string): Promise<UserDashboard | null> {
    const { Items = [] } = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `USER#${userId}` },
      }),
    );

    if (Items.length === 0) return null;

    let profile: User | null = null;
    const addresses: Address[] = [];
    const payments: Payment[] = [];
    const orders: Order[] = [];

    for (const item of Items) {
      const sk = item.SK as string;
      if (sk === "#PROFILE") {
        profile = UserMapper.profileToDomain(item);
      } else if (sk.startsWith("ADDRESS#")) {
        addresses.push(UserMapper.addressToDomain(item));
      } else if (sk.startsWith("PAYMENT#")) {
        payments.push(UserMapper.paymentToDomain(item));
      } else if (sk.startsWith("ORDER#")) {
        orders.push(OrderMapper.orderRefToDomain(item));
      }
    }

    if (!profile) return null;

    return { profile, addresses, payments, orders };
  }
}
