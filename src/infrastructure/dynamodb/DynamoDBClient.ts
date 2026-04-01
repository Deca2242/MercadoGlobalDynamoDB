import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { environment } from "../config/environment";

export function createDynamoDBDocClient(): DynamoDBDocumentClient {
  const baseClient = new DynamoDBClient({
    endpoint: environment.dynamodb.endpoint,
    region: environment.dynamodb.region,
    credentials: {
      accessKeyId: environment.dynamodb.accessKeyId,
      secretAccessKey: environment.dynamodb.secretAccessKey,
    },
  });

  return DynamoDBDocumentClient.from(baseClient, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
}
