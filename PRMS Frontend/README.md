# PRMS Frontend

Next.js frontend for the **Procurement Resource Management System (PRMS)** — INSA ERP.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.5 | React framework (App Router) |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | - | Accessible component library |
| TanStack React Query | 5.x | Server state, caching, refetching |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Schema validation |
| Lucide React | - | Icons |

---

## Prerequisites

- Node.js 18+
- npm 9+
- Backend running on `http://localhost:8080`
- Keycloak running on `http://localhost:8180`

---

## How to Run

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Configure environment

Copy the example file:
```bash
copy .env.example .env.local
```

`.env.local` contents:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8180
NEXT_PUBLIC_KEYCLOAK_REALM=prms
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=prms-frontend
```

### Step 3 — Start development server

```bash
npm run dev
```

Open: `http://localhost:3000`

### Production build

```bash
npm run build
npm start
```

---

## Project Structure

```
PRMS Frontend/
├── app/
│   ├── login/               # Login page (Keycloak auth)
│   ├── unauthorized/        # Access denied page
│   └── (dashboard)/
│       └── prms/
│           ├── page.tsx         # Dashboard (role-based)
│           ├── suppliers/       # Vendor management
│           ├── purchase-requests/
│           ├── approvals/
│           ├── rfq/             # Request for Quotation
│           ├── quotations/
│           ├── purchase-orders/
│           ├── goods-receipt/
│           ├── invoices/
│           ├── contracts/
│           ├── audit/           # Audit trail
│           ├── evaluation/
│           ├── reports/
│           └── settings/
├── features/
│   ├── auth/
│   │   ├── contexts/        # AuthProvider, useAuth hook
│   │   ├── services/        # Keycloak login/logout/refresh
│   │   └── types/           # Role definitions
│   └── prms/
│       ├── hooks/           # React Query hooks per module
│       ├── types/           # TypeScript interfaces
│       └── services/        # Legacy service layer
├── lib/
│   ├── api.ts               # Base HTTP client (fetch + retry)
│   ├── prms-api.ts          # All backend API calls + DTOs
│   ├── keycloak.ts          # Keycloak token utilities
│   └── utils.ts             # formatCurrency, formatDate
├── components/ui/           # shadcn components
├── providers/               # React Query provider
└── hooks/                   # use-toast
```

---

## Authentication Flow

```
Login page → Keycloak password grant → JWT token
     ↓
localStorage: access_token, refresh_token
     ↓
AuthProvider reads session → role-based UI
     ↓
Every API call: Authorization: Bearer <token>
     ↓
Token auto-refreshes every 4 minutes
```

---

## Roles and Access

| Role | What they see |
|---|---|
| `PROCUREMENT_ADMIN` | Full dashboard — all modules, KPIs, approvals |
| `REQUESTER` | My purchase requests, submit for approval |
| `SUPPLIER` | RFQs, quotations, purchase orders, invoices |

---

## API Integration

All backend calls go through `lib/api.ts` → `lib/prms-api.ts`.

The base URL is set via `NEXT_PUBLIC_API_BASE_URL`. Every request automatically:
- Reads `access_token` from `localStorage`
- Adds `Authorization: Bearer <token>` header
- Clears tokens and redirects on 401
- Retries on 5xx errors (exponential backoff)

---

## Key Hooks

```typescript
useVendors()                        // GET /vendors
useRequisitionsByRequester(id)      // GET /requisitions?requesterEmployeeId=
usePendingApprovals()               // GET /approvals/pending
useRFQs()                          // GET /rfqs
usePurchaseOrders()                 // GET /purchase-orders
useGoodsReceipts()                  // GET /goods-receipts
useInvoices()                       // GET /invoices
useContracts()                      // GET /contracts
useQuotations(rfqId?)               // GET /quotations
useDashboardStats()                 // GET /dashboard/stats
useEmployee(employeeId)             // GET /integration/hrm/employees/{id}
useInventoryCheck(itemCode)         // GET /integration/mms/inventory/check
```

---

## Test Accounts

| Username | Password | Role |
|---|---|---|
| `procurement_admin` | `admin123` | Admin |
| `requester` | `requester123` | Requester |
| `supplier` | `supplier123` | Supplier |

These are pre-configured in Keycloak and shown on the login page for easy testing.
