import dotenv from "dotenv";

dotenv.config();

export const environment = {
  port: parseInt(process.env.PORT || "3000", 10),
  dynamodb: {
    endpoint: process.env.DYNAMO_ENDPOINT || "http://localhost:8000",
    region: process.env.DYNAMO_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "fakeMyKeyId",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "fakeSecretAccessKey",
  },
  tableName: process.env.TABLE_NAME || "MercadoGlobal",
};
