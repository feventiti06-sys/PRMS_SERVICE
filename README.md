# PRMS — Procurement Resource Management System

A full-stack procurement management system built for the **Information Network Security Administration (INSA)**. Part of the shared ERP platform.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.3.5 | REST API framework |
| Spring Security | 6.x | JWT/OAuth2 resource server |
| Spring Data JPA | 3.x | ORM / database access |
| Hibernate | 6.x | JPA implementation |
| PostgreSQL | 16 | Primary database |
| RabbitMQ | 3 | Event messaging |
| Redis | 7 | Caching |
| Keycloak | 24 | Authentication & authorization |
| OpenFeign | Spring Cloud 2023 | HTTP client for service integration |
| MapStruct | 1.6.3 | DTO mapping |
| Lombok | 1.18.42 | Boilerplate reduction |
| SpringDoc OpenAPI | 2.6.0 | Swagger UI |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.5 | React framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | - | Component library |
| TanStack React Query | 5.x | Server state management |
| Axios / Fetch | - | HTTP client |
| React Hook Form + Zod | - | Form validation |

### Infrastructure
| Service | Port | Purpose |
|---|---|---|
| PostgreSQL | 5432 | Application database |
| Keycloak | 8180 | Identity provider |
| RabbitMQ | 5672 / 15672 | Message broker |
| Redis | 6379 | Cache |
| Spring Boot | 8080 | Backend API |
| Next.js | 3000 | Frontend |

---

## Project Structure

```
INSA-PRMS/
├── src/main/java/com/erp/prms/
│   ├── client/              # Feign clients (FMS, HRM, MMS)
│   ├── config/              # Security, Swagger, RabbitMQ, Feign
│   ├── controller/          # REST controllers
│   ├── dto/                 # Request/Response DTOs
│   ├── entity/              # JPA entities
│   ├── exception/           # Global error handling
│   ├── mapper/              # MapStruct mappers
│   ├── repository/          # JPA repositories
│   ├── scheduler/           # Scheduled tasks
│   ├── service/             # Business logic
│   ├── util/                # Helpers
│   └── validator/           # Domain validators
├── src/main/resources/
│   ├── application.yml      # Configuration
│   └── db/migration/        # Flyway SQL migrations
├── keycloak/realms/
│   └── prms-realm.json      # Keycloak realm auto-import
├── PRMS Frontend/           # Next.js frontend
├── docker-compose.yml       # All infrastructure services
├── Dockerfile               # Backend container
├── .env.example             # Environment variable template
└── pom.xml
```

---

## Prerequisites

Install these before running:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — for PostgreSQL, Keycloak, RabbitMQ, Redis
- [Java 17+](https://adoptium.net/) — for Spring Boot
- [Maven 3.9+](https://maven.apache.org/) — for building the backend
- [Node.js 18+](https://nodejs.org/) — for the frontend

Verify:
```
docker --version
java --version
mvn --version
node --version
npm --version
```

---

## How to Run

### Step 1 — Clone and configure environment

```bash
git clone https://github.com/feventiti06-sys/PRMS_SERVICE.git
cd PRMS_SERVICE
```

Copy environment file:
```bash
copy .env.example .env
```

The defaults in `.env` work out of the box for local development. No changes needed.

---

### Step 2 — Start infrastructure (Docker)

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- RabbitMQ on port 5672 (management UI: 15672)
- Keycloak on port 8180

Wait about **90 seconds** for Keycloak to fully start and import the `prms` realm.

Verify Keycloak is ready:
```bash
curl http://localhost:8180/realms/prms/.well-known/openid-configuration
```
Should return JSON. If it fails, wait 30 more seconds.

---

### Step 3 — Reset the database (first time only)

```bash
docker exec -it prms-postgres psql -U postgres -c "DROP DATABASE IF EXISTS prms;"
docker exec -it prms-postgres psql -U postgres -c "CREATE DATABASE prms;"
```

---

### Step 4 — Start the Spring Boot backend

```bash
mvn spring-boot:run
```

Wait for:
```
Started PrmsApplication in X.XXX seconds
```

Verify:
```
http://localhost:8080/actuator/health
```
Expected: `{"status":"UP"}`

---

### Step 5 — Start the Next.js frontend

Open a new terminal:
```bash
cd "PRMS Frontend"
npm install
npm run dev
```

Wait for:
```
Local: http://localhost:3000
```

---

### Step 6 — Open the application

Go to: `http://localhost:3000`

Login with a test account (click on the login page to auto-fill):

| Username | Password | Role |
|---|---|---|
| `procurement_admin` | `admin123` | Full admin access |
| `requester` | `requester123` | Create purchase requests |
| `supplier` | `supplier123` | Supplier portal |

---

## API Documentation (Swagger)

```
http://localhost:8080/swagger-ui/index.html
```

### Authorize with Keycloak

1. Click the **Authorize** button (top right)
2. Fill in:
   - **Username:** `procurement_admin`
   - **Password:** `admin123`
   - **client_id:** `prms-frontend`
   - **client_secret:** (leave empty)
   - Check **openid** scope
3. Click **Authorize** — Keycloak issues the token automatically
4. All API calls from Swagger will include the Bearer token

---

## Integration Services

PRMS integrates with three other ERP microservices using **OpenFeign** with **Keycloak JWT token relay**:

| Service | Default URL | Purpose |
|---|---|---|
| FMS (Finance) | `http://localhost:8082` | Budget checks, invoice forwarding |
| HRM (Human Resources) | `http://localhost:8083` | Employee validation |
| MMS (Materials Management) | `http://localhost:8081` | Inventory availability |

### How JWT relay works

When PRMS calls FMS/HRM/MMS, it automatically forwards the user's Keycloak Bearer token. This means:
- The user logs in once to Keycloak
- PRMS passes the same token to all downstream services
- FMS/HRM/MMS validate the token against the same Keycloak realm

Configure URLs in `.env`:
```
FMS_BASE_URL=http://fms-service:8082
HRM_BASE_URL=http://hrm-service:8083
MMS_BASE_URL=http://mms-service:8081
```

For FMS/HRM/MMS to accept PRMS tokens, add this to their `application.yml`:
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/prms
```

### Integration endpoints (test via Swagger)

```
GET /api/v1/integration/hrm/employees/{employeeId}
GET /api/v1/integration/hrm/employees/{employeeId}/validate
GET /api/v1/integration/mms/inventory/check?itemCode=&quantity=
GET /api/v1/integration/mms/inventory/items
```

---

## Keycloak Roles

| Role | Access |
|---|---|
| `PROCUREMENT_ADMIN` | Full access to all modules |
| `REQUESTER` | Create and track purchase requests |
| `SUPPLIER` | RFQs, quotations, purchase orders, invoices |

---

## Key Procurement Workflow

```
Purchase Request → Submit → Approval → 
Purchase Order → Goods Receipt → Invoice → FMS
```

1. Requester creates a **Purchase Request** (HRM validates employee, FMS checks budget)
2. Submitted to **Approval** workflow
3. Procurement Admin approves → creates **Purchase Order** (MMS checks inventory)
4. Supplier delivers → **Goods Receipt** recorded
5. Supplier submits **Invoice** → forwarded to FMS automatically

---

## RabbitMQ Events

| Event | Trigger |
|---|---|
| `REQUISITION_SUBMITTED` | When a PR is submitted for approval |
| `PURCHASE_ORDER_CREATED` | When a PO is issued |

RabbitMQ management UI: `http://localhost:15672` (guest/guest)

---

## Stop All Services

```bash
docker compose down
```

To also delete database data:
```bash
docker compose down -v
```
