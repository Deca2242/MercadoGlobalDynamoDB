import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

/**
 * MiniStack — Define la tabla DynamoDB para MercadoGlobal.
 *
 * Se despliega en LocalStack usando `cdklocal deploy`.
 * Contiene únicamente la tabla principal con su GSI;
 * los datos semilla se insertan aparte con el script `seed-local.sh`.
 */
export class MercadoGlobalStack extends Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /* ------------------------------------------------------------------ */
    /*  Tabla principal — Single Table Design                             */
    /* ------------------------------------------------------------------ */

    this.table = new dynamodb.Table(this, "MercadoGlobalTable", {
      tableName: "MercadoGlobal",
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // Dev local — destruir al hacer cdk destroy
    });

    /* ------------------------------------------------------------------ */
    /*  GSI — Filtrar pedidos de un usuario por estado y fecha             */
    /* ------------------------------------------------------------------ */

    this.table.addGlobalSecondaryIndex({
      indexName: "GSI1-UserStatus-Date",
      partitionKey: { name: "GSI1PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "GSI1SK", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
