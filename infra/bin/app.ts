#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { MercadoGlobalStack } from "../lib/MercadoGlobalStack";

const app = new cdk.App();

new MercadoGlobalStack(app, "MercadoGlobalStack", {
  env: {
    account: "000000000000", // LocalStack default account
    region: "us-east-1",
  },
});
