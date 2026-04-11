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
import { mapAwsError } from "../../shared/infrastructureErrorHandler";

export class DynamoDBUserRepository implements UserRepositoryPort {
  constructor(
    private readonly docClient: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  async findProfile(userId: string): Promise<User | null> {
    try {
      const { Item } = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { PK: `USER#${userId}`, SK: "#PROFILE" },
        }),
      );
      return Item ? UserMapper.profileToDomain(Item) : null;
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async createProfile(user: User): Promise<void> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: UserMapper.profileToDynamo(user),
        }),
      );
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async listAddresses(userId: string): Promise<Address[]> {
    try {
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
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async addAddress(address: Address): Promise<void> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: UserMapper.addressToDynamo(address),
        }),
      );
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { PK: `USER#${userId}`, SK: `ADDRESS#${addressId}` },
        }),
      );
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async listPayments(userId: string): Promise<Payment[]> {
    try {
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
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async addPayment(payment: Payment): Promise<void> {
    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: UserMapper.paymentToDynamo(payment),
        }),
      );
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async deletePayment(userId: string, paymentId: string): Promise<void> {
    try {
      await this.docClient.send(
        new DeleteCommand({
          TableName: this.tableName,
          Key: { PK: `USER#${userId}`, SK: `PAYMENT#${paymentId}` },
        }),
      );
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async listOrders(userId: string): Promise<Order[]> {
    try {
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
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async filterOrdersByStatus(
    userId: string,
    status: string,
  ): Promise<Order[]> {
    try {
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
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async getDashboard(userId: string): Promise<UserDashboard | null> {
    try {
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
    } catch (error) {
      throw mapAwsError(error);
    }
  }
}
