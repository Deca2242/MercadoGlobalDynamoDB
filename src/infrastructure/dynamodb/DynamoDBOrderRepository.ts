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
import { UserMapper } from "./mappers/UserMapper";

export class DynamoDBOrderRepository implements OrderRepositoryPort {
  constructor(
    private readonly docClient: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  async getHeader(orderId: string): Promise<Order | null> {
    const { Item } = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `ORDER#${orderId}`, SK: "#METADATA" },
      }),
    );
    return Item ? OrderMapper.metadataToDomain(Item) : null;
  }

  async listItems(orderId: string): Promise<OrderItem[]> {
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
  }

  async getFullDetail(orderId: string): Promise<OrderDetail | null> {
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
  }

  async createOrder(input: CreateOrderInput): Promise<void> {
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
              Item: UserMapper.orderRefToDynamo(order),
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
  }

  async updateStatus(
    orderId: string,
    userId: string,
    newStatus: string,
  ): Promise<void> {
    const current = await this.getHeader(orderId);
    if (!current) return;

    const datePrefix = current.date.substring(0, 19) + "Z";
    const orderRefSK = `ORDER#${datePrefix}#${orderId}`;

    await this.docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: this.tableName,
              Key: { PK: `ORDER#${orderId}`, SK: "#METADATA" },
              UpdateExpression: "SET #s = :newStatus",
              ExpressionAttributeNames: { "#s": "status" },
              ExpressionAttributeValues: { ":newStatus": newStatus },
            },
          },
          {
            Update: {
              TableName: this.tableName,
              Key: { PK: `USER#${userId}`, SK: orderRefSK },
              UpdateExpression: "SET #s = :newStatus, GSI1PK = :gsi1pk",
              ExpressionAttributeNames: { "#s": "status" },
              ExpressionAttributeValues: {
                ":newStatus": newStatus,
                ":gsi1pk": `USER#${userId}#STATUS#${newStatus}`,
              },
            },
          },
        ],
      }),
    );
  }
}
