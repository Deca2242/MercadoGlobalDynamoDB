# Arquitectura Hexagonal — MercadoGlobal API

## Que es la Arquitectura Hexagonal

La arquitectura hexagonal (tambien llamada **Ports & Adapters**) fue propuesta por
Alistair Cockburn. Su objetivo es crear aplicaciones donde la logica de negocio
este completamente aislada de los detalles tecnicos (frameworks, bases de datos,
protocolos HTTP, etc.).

La idea central es sencilla: **el dominio esta en el centro y no conoce nada del
mundo exterior**. Todo lo externo se conecta a traves de "puertos" (interfaces)
y "adaptadores" (implementaciones concretas).

---

## Las 3 Capas

```
┌──────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                           │
│                                                              │
│  ┌──────────────────┐              ┌──────────────────────┐  │
│  │  Adaptadores de  │              │  Adaptadores de      │  │
│  │  ENTRADA          │              │  SALIDA              │  │
│  │  (driving)        │              │  (driven)            │  │
│  │                  │              │                      │  │
│  │  - Express       │              │  - DynamoDB          │  │
│  │    Routes        │              │    Repositories      │  │
│  │  - Controllers   │              │  - Mappers           │  │
│  └────────┬─────────┘              └──────────┬───────────┘  │
│           │                                   │              │
│           ▼                                   │              │
│  ┌────────────────────────────────────────────┘              │
│  │                                                           │
│  │              APPLICATION LAYER                            │
│  │                                                           │
│  │   UserService          OrderService                       │
│  │   - getProfile()       - getHeader()                      │
│  │   - listAddresses()    - listItems()                      │
│  │   - createProfile()    - createOrder()                    │
│  │                                                           │
│  │   Solo dependen de los PUERTOS (interfaces),              │
│  │   nunca de implementaciones concretas.                    │
│  │                                                           │
│  └────────────────────────┬──────────────────────────────────┘
│                           │                                  │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐   │
│  │                                                       │   │
│  │                   DOMAIN LAYER                        │   │
│  │                   (centro)                            │   │
│  │                                                       │   │
│  │   Entities:                                           │   │
│  │     User, Address, Payment, Order, OrderItem          │   │
│  │                                                       │   │
│  │   Ports (interfaces):                                 │   │
│  │     UserRepositoryPort, OrderRepositoryPort           │   │
│  │                                                       │   │
│  │   NO importa nada externo.                            │   │
│  │   Es TypeScript puro, sin frameworks.                 │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

Regla de dependencias: las flechas SIEMPRE apuntan hacia adentro.
Infrastructure → Application → Domain
Nunca al reves.
```

### 1. Domain Layer (Centro)

Es el corazon de la aplicacion. Contiene:

- **Entidades**: Objetos que representan los conceptos del negocio (`User`,
  `Address`, `Payment`, `Order`, `OrderItem`). Son clases/interfaces de
  TypeScript puro, sin decoradores ni dependencias externas.

- **Puertos (Ports)**: Interfaces que definen QUE operaciones necesita el
  dominio, sin decir COMO se implementan. Ejemplo: `UserRepositoryPort`
  define `findProfile(userId)` pero no dice si usa DynamoDB, MongoDB o un
  archivo JSON.

**Regla absoluta**: Esta capa NO importa nada de Express, AWS SDK, ni
ningun paquete externo. Si ves un `import` de `express` o `@aws-sdk` en
esta carpeta, algo esta mal.

### 2. Application Layer (Intermedia)

Contiene los **servicios** (tambien llamados "casos de uso") que orquestan
la logica de la aplicacion:

- `UserService`: Coordina operaciones sobre usuarios, direcciones y pagos.
- `OrderService`: Coordina operaciones sobre pedidos.

Cada servicio recibe un **puerto** (interfaz) en su constructor, NO la
implementacion concreta. Esto se llama **inyeccion de dependencias**:

```typescript
class UserService {
  constructor(private readonly userRepo: UserRepositoryPort) {}
  //                                     ^^^^^^^^^^^^^^^^^^
  //                                     Interfaz, no clase concreta
}
```

El servicio llama a `this.userRepo.findProfile("luisa")` sin saber si
por detras hay DynamoDB, PostgreSQL o un mock de prueba.

### 3. Infrastructure Layer (Exterior)

Contiene los **adaptadores**, que son las implementaciones concretas que
conectan el mundo exterior con la aplicacion. Se dividen en dos tipos:

#### Adaptadores de Entrada (Driving Adapters)

Son los que **inician** la accion. En nuestro caso: Express.

- **Routes**: Definen los endpoints HTTP (`GET /api/users/:userId/profile`).
- **Controllers**: Reciben `req` y `res` de Express, extraen los datos,
  llaman al servicio correspondiente y devuelven la respuesta JSON.

#### Adaptadores de Salida (Driven Adapters)

Son los que el dominio **necesita** para funcionar. En nuestro caso: DynamoDB.

- **DynamoDBUserRepository**: Implementa `UserRepositoryPort` usando el
  AWS SDK v3 para ejecutar `GetCommand`, `QueryCommand`, `PutCommand`, etc.
- **DynamoDBOrderRepository**: Implementa `OrderRepositoryPort`.
- **Mappers**: Convierten entre el formato crudo de DynamoDB (con PK, SK,
  prefijos) y las entidades limpias del dominio.

---

## Flujo de una Peticion

```
Cliente HTTP
    │
    ▼
Express Router (userRoutes.ts)
    │  Recibe GET /api/users/luisa/profile
    ▼
UserController.getProfile(req, res)
    │  Extrae userId = "luisa" de req.params
    ▼
UserService.getProfile("luisa")
    │  Llama al puerto: this.userRepo.findProfile("luisa")
    ▼
DynamoDBUserRepository.findProfile("luisa")
    │  Ejecuta GetCommand con PK="USER#luisa", SK="#PROFILE"
    ▼
DynamoDB Local (puerto 8000)
    │  Devuelve: { PK: "USER#luisa", SK: "#PROFILE", name: "Luisa", email: "l@x.com" }
    ▼
UserMapper.toDomain(item)
    │  Convierte a: { userId: "luisa", name: "Luisa", email: "l@x.com" }
    ▼
Respuesta sube por las capas
    │
    ▼
res.status(200).json({ userId: "luisa", name: "Luisa", email: "l@x.com" })
```

---

## Inyeccion de Dependencias

La conexion entre capas se hace en `container.ts`. Este archivo es el unico
lugar donde se crean las instancias concretas y se "inyectan" en los servicios:

```typescript
// container.ts — Aqui se conecta todo
const dynamoClient = createDynamoDBClient();

// Adaptadores de salida (implementan los puertos)
const userRepo = new DynamoDBUserRepository(dynamoClient);
const orderRepo = new DynamoDBOrderRepository(dynamoClient);

// Servicios (reciben los puertos, no las clases concretas)
const userService = new UserService(userRepo);
const orderService = new OrderService(orderRepo);

// Adaptadores de entrada (reciben los servicios)
const userController = new UserController(userService);
const orderController = new OrderController(orderService);
```

Si quisieras cambiar DynamoDB por MongoDB, solo cambiarias este archivo:

```typescript
const userRepo = new MongoDBUserRepository(mongoClient); // <-- cambio aqui
const userService = new UserService(userRepo);            // <-- igual, no se toca
```

---

## Modelo de Datos DynamoDB

### Single Table Design

Toda la informacion esta en UNA sola tabla: `MercadoGlobal`.
Los prefijos en PK y SK identifican el tipo de dato:

| PK              | SK                                  | Entidad         |
|-----------------|-------------------------------------|-----------------|
| USER#luisa      | #PROFILE                            | Perfil usuario  |
| USER#luisa      | ADDRESS#addr1                       | Direccion       |
| USER#luisa      | PAYMENT#pay1                        | Metodo de pago  |
| USER#luisa      | ORDER#2023-10-27T08:00Z#ORD555      | Pedido (ref)    |
| ORDER#ORD555    | #METADATA                           | Encabezado orden|
| ORDER#ORD555    | ITEM#laptop-xps                     | Item de orden   |

### GSI: GSI1-UserStatus-Date

| GSI1PK                            | GSI1SK              | Uso                    |
|-----------------------------------|----------------------|------------------------|
| USER#luisa#STATUS#Pago exitoso    | 2023-10-27T08:00Z    | Filtrar pedidos x estado|

---

## Estructura de Carpetas

```
src/
├── domain/                     ← CAPA DE DOMINIO
│   ├── entities/               ← Entidades del negocio
│   │   ├── User.ts
│   │   ├── Address.ts
│   │   ├── Payment.ts
│   │   ├── Order.ts
│   │   └── OrderItem.ts
│   └── ports/                  ← Interfaces (contratos)
│       ├── UserRepositoryPort.ts
│       └── OrderRepositoryPort.ts
│
├── application/                ← CAPA DE APLICACION
│   ├── services/               ← Casos de uso
│   │   ├── UserService.ts
│   │   └── OrderService.ts
│   └── validators/             ← Schemas Zod de validacion
│       ├── OrderValidator.ts
│       └── UserValidator.ts
│
├── infrastructure/             ← CAPA DE INFRAESTRUCTURA
│   ├── http/                   ← Adaptadores de ENTRADA
│   │   ├── controllers/
│   │   │   ├── UserController.ts
│   │   │   └── OrderController.ts
│   │   ├── routes/
│   │   │   ├── userRoutes.ts
│   │   │   └── orderRoutes.ts
│   │   └── middlewares/
│   │       └── errorHandler.ts
│   ├── dynamodb/               ← Adaptadores de SALIDA
│   │   ├── DynamoDBClient.ts
│   │   ├── DynamoDBUserRepository.ts
│   │   ├── DynamoDBOrderRepository.ts
│   │   └── mappers/
│   │       ├── UserMapper.ts
│   │       └── OrderMapper.ts
│   └── config/
│       └── environment.ts
│
├── shared/                     ← Utilidades compartidas
│   ├── AppError.ts
│   └── validation.ts
│
├── container.ts                ← Inyeccion de dependencias
└── app.ts                      ← Entry point
```

---

## Endpoints REST

### Lectura

| Metodo | Endpoint                              | Access Pattern | Operacion DynamoDB              |
|--------|---------------------------------------|----------------|---------------------------------|
| GET    | /api/users/:userId/profile            | AP1            | GetItem                         |
| GET    | /api/users/:userId/addresses          | AP2            | Query begins_with(SK, ADDRESS#) |
| GET    | /api/users/:userId/payments           | AP3            | Query begins_with(SK, PAYMENT#) |
| GET    | /api/users/:userId/orders             | AP4            | Query begins_with(SK, ORDER#) DESC |
| GET    | /api/users/:userId/orders?status=X    | AP5            | Query GSI1                      |
| GET    | /api/users/:userId/dashboard          | —              | Query PK (todo en 1 llamada)    |
| GET    | /api/orders/:orderId                  | AP6            | GetItem #METADATA               |
| GET    | /api/orders/:orderId/items            | AP7            | Query begins_with(SK, ITEM#)    |
| GET    | /api/orders/:orderId/detail           | AP8            | Query PK (header + items)       |

### Escritura

| Metodo | Endpoint                                        | Operacion DynamoDB     |
|--------|-------------------------------------------------|------------------------|
| POST   | /api/users                                      | PutItem                |
| POST   | /api/users/:userId/addresses                    | PutItem                |
| POST   | /api/users/:userId/payments                     | PutItem                |
| DELETE | /api/users/:userId/addresses/:addressId         | DeleteItem             |
| DELETE | /api/users/:userId/payments/:paymentId          | DeleteItem             |
| POST   | /api/orders                                     | TransactWriteItems     |
| PATCH  | /api/orders/:orderId/status                     | UpdateItem             |

---

## Conceptos Clave de Express

- **app.use(middleware)**: Registra un middleware que procesa TODAS las peticiones.
- **Router**: Agrupa rutas relacionadas bajo un prefijo comun.
- **req.params**: Valores extraidos de la URL (ej: `:userId` → `req.params.userId`).
- **req.query**: Query strings (ej: `?status=Enviado` → `req.query.status`).
- **req.body**: Cuerpo JSON de peticiones POST/PATCH.
- **next(error)**: Pasa un error al middleware de errores global.
- **Middleware de errores**: Funcion con 4 parametros `(err, req, res, next)` que
  captura todos los errores y responde con JSON uniforme.

## Conceptos Clave de DynamoDB usados

- **GetCommand**: Obtiene 1 item exacto por PK + SK.
- **QueryCommand**: Obtiene multiples items que comparten la misma PK.
- **begins_with(SK, prefijo)**: Filtra items cuyo SK empieza con un prefijo.
- **ScanIndexForward: false**: Invierte el orden (mas reciente primero).
- **PutCommand**: Inserta o reemplaza un item completo.
- **DeleteCommand**: Elimina un item por PK + SK.
- **UpdateCommand**: Modifica atributos puntuales sin reemplazar todo el item.
- **TransactWriteCommand**: Escribe multiples items de forma atomica (todo o nada).
