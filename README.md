# MercadoGlobal API 

#### Grupo 3 - integrantes 

- Cristian Peña
- Victor Navarro
- Diego Castro
- Cristian Barrera

MercadoGlobal es una API RESTful construida con **Node.js, TypeScript y Express**, diseñada utilizando los principios de la **Arquitectura Hexagonal (Ports & Adapters)**. Utiliza **Amazon DynamoDB** como base de datos principal implementando el patrón de diseño de tabla única (Single Table Design).

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue estrictamente la **Arquitectura Hexagonal**, cuyo objetivo es mantener la lógica de negocio completamente aislada de los detalles técnicos y frameworks externos. Se divide en 3 capas principales:

1. **Domain Layer (Centro):**
   Es el corazón de la aplicación. Contiene las **Entidades** (como `User`, `Order`, `Address`) y los **Puertos** (interfaces que definen los contratos para los repositorios). Esta capa es TypeScript puro y **no tiene dependencias externas**.

2. **Application Layer (Intermedia):**
   Contiene los **Servicios** (Casos de Uso) que orquestan la lógica de la aplicación (ej. `UserService`, `OrderService`). Estos servicios se comunican con el exterior únicamente a través de las interfaces definidas en el dominio (Inyección de dependencias).

3. **Infrastructure Layer (Exterior):**
   Contiene los **Adaptadores** que conectan el núcleo con el mundo exterior:
   - **Adaptadores de Entrada (Driving):** Rutas y Controladores de Express.
   - **Adaptadores de Salida (Driven):** Repositorios de DynamoDB (`DynamoDBUserRepository`, etc.) y Mappers.

---

## 🗄️ Base de Datos: DynamoDB (Single Table Design)

La base de datos utiliza un modelo **Single Table Design** en DynamoDB, alojando toda la información en una única tabla llamada `MercadoGlobal`.

### Esquema de Claves (PK y SK)

Los prefijos en la Partition Key (PK) y Sort Key (SK) identifican el tipo de entidad:

| Entidad             | Partition Key (PK) | Sort Key (SK)                       |
|---------------------|--------------------|-------------------------------------|
| Perfil de Usuario   | `USER#<userId>`    | `#PROFILE`                          |
| Dirección           | `USER#<userId>`    | `ADDRESS#<addressId>`               |
| Método de Pago      | `USER#<userId>`    | `PAYMENT#<paymentId>`               |
| Referencia de Pedido| `USER#<userId>`    | `ORDER#<fecha>#<orderId>`           |
| Encabezado de Pedido| `ORDER#<orderId>`  | `#METADATA`                         |
| Item del Pedido     | `ORDER#<orderId>`  | `ITEM#<itemId>`                     |

### Índices Secundarios Globales (GSI)
- **GSI1:** Se utiliza para realizar consultas de filtrado, por ejemplo, obtener los pedidos de un usuario filtrados por su estado (`GSI1PK`: `USER#<userId>#STATUS#<status>`, `GSI1SK`: `<fecha>`).

---

## 💻 Tecnologías y Dependencias

**Core:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) (v5.x)
- [TypeScript](https://www.typescriptlang.org/)

**Base de Datos:**
- [AWS SDK v3 para DynamoDB](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/) (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`)
- [LocalStack](https://localstack.cloud/) + [CDK Local](https://github.com/localstack/aws-cdk-local) (para desarrollo)
- Redis como caché distribuida

**Utilidades:**
- **Zod:** Validación estricta de esquemas de datos.
- **UUID:** Generación de identificadores únicos.
- **Cors & Dotenv:** Seguridad y gestión de variables de entorno.

**Herramientas de Desarrollo:**
- `nodemon` y `ts-node` para la ejecución y recarga en caliente durante el desarrollo.

---

## 🚀 Pasos para arrancar el proyecto

### 1. Prerrequisitos
- Node.js (v18 o superior)
- Docker (para correr LocalStack y Redis)

### 2. Instalación de dependencias
Clona el repositorio e instala los paquetes de NPM:
```bash
npm install
cd infra && npm install && cd ..
```

### 3. Configuración de Variables de Entorno
Copia el archivo de ejemplo y ajusta los valores si es necesario:
```bash
cp .env.example .env
```

### 4. Iniciar LocalStack y Redis
```bash
docker compose up -d
```

Esto levanta:
- **LocalStack** (`localhost:4566`) — emula DynamoDB + CloudFormation
- **Redis** (`localhost:6379`) — caché distribuida

### 5. Crear la tabla DynamoDB con CDK Local
Bootstrap y deploy del ministack CDK contra LocalStack:
```bash
npm run cdk:bootstrap
npm run cdk:deploy
```

Esto crea la tabla `MercadoGlobal` con el GSI `GSI1-UserStatus-Date`.

### 6. Cargar datos de ejemplo
```bash
npm run seed
```

Para verificar la tabla local:
```bash
aws dynamodb list-tables --endpoint-url http://localhost:4566
aws dynamodb scan --table-name MercadoGlobal --select COUNT --endpoint-url http://localhost:4566
```

### 7. Levantar el Servidor
Para iniciar el entorno de desarrollo con recarga automática:
```bash
npm run dev
```

Para compilar y correr la versión de producción:
```bash
npm run build
npm start
```

---

## 📡 Endpoints Principales

La API cuenta con diversas rutas para interactuar con las entidades:

**Usuarios:**
- `GET /api/users/:userId/profile` - Obtiene el perfil del usuario.
- `GET /api/users/:userId/dashboard` - Obtiene toda la información consolidada de un usuario.
- `POST /api/users` - Crea un nuevo usuario.

**Pedidos:**
- `GET /api/orders/:orderId/detail` - Obtiene el detalle completo de un pedido.
- `POST /api/orders` - Crea un nuevo pedido (usando transacciones atómicas).
- `PATCH /api/orders/:orderId/status` - Actualiza el estado de un pedido.
