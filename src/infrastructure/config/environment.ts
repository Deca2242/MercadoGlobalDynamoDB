import dotenv from "dotenv";

dotenv.config();

export const environment = {
  port: parseInt(process.env.PORT || "3000", 10),
  dynamodb: {
    endpoint: process.env.DYNAMO_ENDPOINT || "http://localhost:8000",
    region: process.env.DYNAMO_REGION || "us-east-1",
  },
  tableName: process.env.TABLE_NAME || "MercadoGlobal",
};
