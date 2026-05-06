#!/bin/sh
set -eu

DYNAMO_ENDPOINT="${DYNAMO_ENDPOINT:-http://dynamodb-local:8000}"
TABLE_NAME="${TABLE_NAME:-MercadoGlobal}"

echo "Waiting for DynamoDB Local at ${DYNAMO_ENDPOINT}..."
until aws dynamodb list-tables --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null 2>&1; do
  sleep 1
done

if aws dynamodb describe-table --table-name "${TABLE_NAME}" --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null 2>&1; then
  echo "Table ${TABLE_NAME} already exists."
else
  echo "Creating table ${TABLE_NAME}..."
  aws dynamodb create-table \
    --table-name "${TABLE_NAME}" \
    --attribute-definitions \
      AttributeName=PK,AttributeType=S \
      AttributeName=SK,AttributeType=S \
      AttributeName=GSI1PK,AttributeType=S \
      AttributeName=GSI1SK,AttributeType=S \
    --key-schema \
      AttributeName=PK,KeyType=HASH \
      AttributeName=SK,KeyType=RANGE \
    --global-secondary-indexes '[
      {
        "IndexName": "GSI1-UserStatus-Date",
        "KeySchema": [
          {"AttributeName":"GSI1PK","KeyType":"HASH"},
          {"AttributeName":"GSI1SK","KeyType":"RANGE"}
        ],
        "Projection": {"ProjectionType":"ALL"}
      }
    ]' \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null
fi

aws dynamodb wait table-exists \
  --table-name "${TABLE_NAME}" \
  --endpoint-url "${DYNAMO_ENDPOINT}"

echo "Seeding ${TABLE_NAME}..."

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":    {"S": "USER#luisa"},
    "SK":    {"S": "#PROFILE"},
    "name":  {"S": "Luisa"},
    "email": {"S": "l@x.com"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":     {"S": "USER#luisa"},
    "SK":     {"S": "ADDRESS#addr1"},
    "street": {"S": "Calle 10"},
    "city":   {"S": "Bogotá"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":     {"S": "USER#luisa"},
    "SK":     {"S": "ADDRESS#addr2"},
    "street": {"S": "Ave. 5"},
    "city":   {"S": "Medellín"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":    {"S": "USER#luisa"},
    "SK":    {"S": "PAYMENT#pay1"},
    "type":  {"S": "Visa"},
    "last4": {"S": "1234"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":   {"S": "USER#luisa"},
    "SK":   {"S": "PAYMENT#pay2"},
    "type": {"S": "PayPal"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":              {"S": "USER#luisa"},
    "SK":              {"S": "ORDER#2023-10-27T08:00Z#ORD555"},
    "orderId":         {"S": "ORD555"},
    "status":          {"S": "Pago exitoso"},
    "total":           {"N": "1250"},
    "shippingAddress": {"S": "Calle 10 Bogotá"},
    "GSI1PK":          {"S": "USER#luisa#STATUS#Pago exitoso"},
    "GSI1SK":          {"S": "2023-10-27T08:00Z"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":              {"S": "USER#luisa"},
    "SK":              {"S": "ORDER#2023-11-01T09:15Z#ORD600"},
    "orderId":         {"S": "ORD600"},
    "status":          {"S": "Enviado"},
    "total":           {"N": "300"},
    "shippingAddress": {"S": "Calle 10 Bogotá"},
    "GSI1PK":          {"S": "USER#luisa#STATUS#Enviado"},
    "GSI1SK":          {"S": "2023-11-01T09:15Z"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":              {"S": "ORDER#ORD555"},
    "SK":              {"S": "#METADATA"},
    "userId":          {"S": "USER#luisa"},
    "status":          {"S": "Pago exitoso"},
    "total":           {"N": "1250"},
    "date":            {"S": "2023-10-27"},
    "shippingAddress": {"S": "Calle 10 Bogotá"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":          {"S": "ORDER#ORD555"},
    "SK":          {"S": "ITEM#laptop-xps"},
    "productName": {"S": "Laptop XPS"},
    "qty":         {"N": "1"},
    "unitPrice":   {"N": "1200"},
    "subtotal":    {"N": "1200"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":          {"S": "ORDER#ORD555"},
    "SK":          {"S": "ITEM#libro-capital"},
    "productName": {"S": "Libro El Capital"},
    "qty":         {"N": "2"},
    "unitPrice":   {"N": "25"},
    "subtotal":    {"N": "50"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

echo "DynamoDB Local is ready with table ${TABLE_NAME} and seed data."
