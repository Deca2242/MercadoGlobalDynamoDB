#!/bin/sh
set -eu

DYNAMO_ENDPOINT="${DYNAMO_ENDPOINT:-http://localhost:4566}"
TABLE_NAME="${TABLE_NAME:-MercadoGlobal}"

echo "Seeding ${TABLE_NAME} at ${DYNAMO_ENDPOINT}..."

# ── Esperar a que la tabla exista (creada por cdklocal deploy) ──────────
echo "Waiting for table ${TABLE_NAME}..."
until aws dynamodb describe-table \
  --table-name "${TABLE_NAME}" \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null 2>&1; do
  sleep 1
done

echo "Table ${TABLE_NAME} found. Inserting seed data..."

# ── Usuario: Luisa ──────────────────────────────────────────────────────

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
    "type":  {"S": "credit"},
    "last4": {"S": "1234"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":   {"S": "USER#luisa"},
    "SK":   {"S": "PAYMENT#pay2"},
    "type": {"S": "paypal"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

# ── Pedidos de Luisa ────────────────────────────────────────────────────

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":              {"S": "USER#luisa"},
    "SK":              {"S": "ORDER#2023-10-27T08:00Z#ORD555"},
    "orderId":         {"S": "ORD555"},
    "status":          {"S": "delivered"},
    "total":           {"N": "1250"},
    "shippingAddress": {"S": "Calle 10 Bogotá"},
    "GSI1PK":          {"S": "USER#luisa#STATUS#delivered"},
    "GSI1SK":          {"S": "2023-10-27T08:00Z"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":              {"S": "USER#luisa"},
    "SK":              {"S": "ORDER#2023-11-01T09:15Z#ORD600"},
    "orderId":         {"S": "ORD600"},
    "status":          {"S": "shipped"},
    "total":           {"N": "300"},
    "shippingAddress": {"S": "Calle 10 Bogotá"},
    "GSI1PK":          {"S": "USER#luisa#STATUS#shipped"},
    "GSI1SK":          {"S": "2023-11-01T09:15Z"}
  }' \
  --endpoint-url "${DYNAMO_ENDPOINT}" >/dev/null

# ── Orden ORD555: metadata + items ─────────────────────────────────────

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item '{
    "PK":              {"S": "ORDER#ORD555"},
    "SK":              {"S": "#METADATA"},
    "userId":          {"S": "USER#luisa"},
    "status":          {"S": "delivered"},
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

echo "Seed data inserted into ${TABLE_NAME} successfully."
