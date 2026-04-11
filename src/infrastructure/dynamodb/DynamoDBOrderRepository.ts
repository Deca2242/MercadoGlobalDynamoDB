import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  OrderRepositoryPort,
  OrderDetail,
  CreateOrderInput,
} from "../../domain/ports/OrderRepositoryPort";
import { Order } from "../../domain/entities/Order";
import { OrderItem } from "../../domain/entities/OrderItem";
import { OrderMapper } from "./mappers/OrderMapper";
import { mapAwsError } from "../../shared/infrastructureErrorHandler";

export class DynamoDBOrderRepository implements OrderRepositoryPort {
  constructor(
    private readonly docClient: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  async getHeader(orderId: string): Promise<Order | null> {
    try {
      const { Item } = await this.docClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { PK: `ORDER#${orderId}`, SK: "#METADATA" },
        }),
      );
      return Item ? OrderMapper.metadataToDomain(Item) : null;
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async listItems(orderId: string): Promise<OrderItem[]> {
    try {
      const { Items = [] } = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
          ExpressionAttributeValues: {
            ":pk": `ORDER#${orderId}`,
            ":prefix": "ITEM#",
          },
        }),
      );
      return Items.map(OrderMapper.itemToDomain);
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async getFullDetail(orderId: string): Promise<OrderDetail | null> {
    try {
      const { Items = [] } = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: { ":pk": `ORDER#${orderId}` },
        }),
      );

      if (Items.length === 0) return null;

      let order: Order | null = null;
      const items: OrderItem[] = [];

      for (const item of Items) {
        const sk = item.SK as string;
        if (sk === "#METADATA") {
          order = OrderMapper.metadataToDomain(item);
        } else if (sk.startsWith("ITEM#")) {
          items.push(OrderMapper.itemToDomain(item));
        }
      }

      if (!order) return null;

      return { order, items };
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async createOrder(input: CreateOrderInput): Promise<void> {
    try {
      const { order, items } = input;

      await this.docClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: this.tableName,
                Item: OrderMapper.metadataToDynamo(order),
              },
            },
            {
              Put: {
                TableName: this.tableName,
                Item: OrderMapper.orderRefToDynamo(order),
              },
            },
            ...items.map((item) => ({
              Put: {
                TableName: this.tableName,
                Item: OrderMapper.itemToDynamo(item),
              },
            })),
          ],
        }),
      );
    } catch (error) {
      throw mapAwsError(error);
    }
  }

  async updateStatus(order: Order, newStatus: string): Promise<void> {
    try {
      const datePrefix = order.date.substring(0, 19) + "Z";
      const orderRefSK = `ORDER#${datePrefix}#${order.orderId}`;

      await this.docClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Update: {
                TableName: this.tableName,
                Key: { PK: `ORDER#${order.orderId}`, SK: "#METADATA" },
                UpdateExpression: "SET #s = :newStatus",
                ExpressionAttributeNames: { "#s": "status" },
                ExpressionAttributeValues: { ":newStatus": newStatus },
              },
            },
            {
              Update: {
                TableName: this.tableName,
                Key: { PK: `USER#${order.userId}`, SK: orderRefSK },
                UpdateExpression: "SET #s = :newStatus, GSI1PK = :gsi1pk",
                ExpressionAttributeNames: { "#s": "status" },
                ExpressionAttributeValues: {
                  ":newStatus": newStatus,
                  ":gsi1pk": `USER#${order.userId}#STATUS#${newStatus}`,
                },
              },
            },
          ],
        }),
      );
    } catch (error) {
      throw mapAwsError(error);
    }
  }
}
