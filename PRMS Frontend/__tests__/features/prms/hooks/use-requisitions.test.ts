/**
 * Unit tests for the requisition API layer (requisitionApi in prms-api.ts)
 *
 * Tests cover:
 * - listByRequester() calls correct endpoint with query param
 * - getById() calls correct endpoint
 * - create() POSTs correct body
 * - submit() POSTs to /submit endpoint
 * - Status mapping via prStatusLabel / prStatusBadge
 */

import { requisitionApi, RequisitionCreateRequest, prStatusLabel, prStatusBadge } from "@/lib/prms-api";

const mockFetch = jest.fn();
global.fetch = mockFetch;

Object.defineProperty(global, "localStorage", {
  value: { getItem: () => "mock-jwt-token", setItem: jest.fn(), removeItem: jest.fn() },
  writable: true,
});

function mockSuccess<T>(data: T) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => ({ success: true, data }),
  } as unknown as Response);
}

function mockHttpError(status: number, message = "Error") {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    headers: { get: () => "application/json" },
    json: async () => ({ message }),
  } as unknown as Response);
}

const MOCK_REQUISITION = {
  id: 1,
  requisitionNumber: "REQ-2024-00001",
  requesterEmployeeId: "emp-001",
  departmentCode: "IT",
  purpose: "Laptop procurement",
  itemDetails: "15 x Dell Latitude",
  estimatedAmount: 750000,
  status: "DRAFT" as const,
  requiredByDate: "2024-04-01",
  approvalWorkflowId: null,
  createdAt: "2024-01-15T09:00:00Z",
};

// ─── listByRequester ──────────────────────────────────────────────────────────

describe("requisitionApi.listByRequester", () => {
  beforeEach(() => mockFetch.mockClear());

  it("calls GET /requisitions with requesterEmployeeId query param", async () => {
    mockSuccess([MOCK_REQUISITION]);
    await requisitionApi.listByRequester("emp-001");
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/requisitions");
    expect(url).toContain("requesterEmployeeId=emp-001");
  });

  it("returns an array of RequisitionResponse", async () => {
    mockSuccess([MOCK_REQUISITION]);
    const result = await requisitionApi.listByRequester("emp-001");
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].requisitionNumber).toBe("REQ-2024-00001");
  });
});

// ─── getById ──────────────────────────────────────────────────────────────────

describe("requisitionApi.getById", () => {
  beforeEach(() => mockFetch.mockClear());

  it("calls GET /requisitions/{id}", async () => {
    mockSuccess(MOCK_REQUISITION);
    await requisitionApi.getById(1);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/requisitions/1");
  });

  it("returns a single RequisitionResponse", async () => {
    mockSuccess(MOCK_REQUISITION);
    const result = await requisitionApi.getById(1);
    expect(result.id).toBe(1);
    expect(result.status).toBe("DRAFT");
  });
});

// ─── create ───────────────────────────────────────────────────────────────────

describe("requisitionApi.create", () => {
  beforeEach(() => mockFetch.mockClear());

  const body: RequisitionCreateRequest = {
    requesterEmployeeId: "emp-001",
    departmentCode: "IT",
    purpose: "Network upgrade",
    itemDetails: "Cisco switches",
    estimatedAmount: 250000,
    requiredByDate: "2024-06-30",
  };

  it("calls POST /requisitions", async () => {
    mockSuccess({ ...MOCK_REQUISITION, id: 2, purpose: body.purpose });
    await requisitionApi.create(body);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/requisitions");
    expect(mockFetch.mock.calls[0][1]?.method).toBe("POST");
  });

  it("sends requiredByDate in YYYY-MM-DD format", async () => {
    mockSuccess({ ...MOCK_REQUISITION, id: 2 });
    await requisitionApi.create(body);
    const sent = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(sent.requiredByDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("sends estimatedAmount as a number (not string)", async () => {
    mockSuccess({ ...MOCK_REQUISITION, id: 2 });
    await requisitionApi.create(body);
    const sent = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(typeof sent.estimatedAmount).toBe("number");
  });
});

// ─── submit ───────────────────────────────────────────────────────────────────

describe("requisitionApi.submit", () => {
  beforeEach(() => mockFetch.mockClear());

  it("calls POST /requisitions/{id}/submit", async () => {
    mockSuccess({ ...MOCK_REQUISITION, status: "PENDING_APPROVAL" });
    await requisitionApi.submit(1);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/requisitions/1/submit");
    expect(mockFetch.mock.calls[0][1]?.method).toBe("POST");
  });

  it("returns the updated RequisitionResponse with new status", async () => {
    mockSuccess({ ...MOCK_REQUISITION, status: "PENDING_APPROVAL" });
    const result = await requisitionApi.submit(1);
    expect(result.status).toBe("PENDING_APPROVAL");
  });
});

// ─── Status helpers ───────────────────────────────────────────────────────────

describe("prStatusLabel — all backend statuses", () => {
  it("maps all 5 backend PRStatus values correctly", () => {
    expect(prStatusLabel("DRAFT")).toBe("Draft");
    expect(prStatusLabel("PENDING_APPROVAL")).toBe("Pending Approval");
    expect(prStatusLabel("APPROVED")).toBe("Approved");
    expect(prStatusLabel("REJECTED")).toBe("Rejected");
    expect(prStatusLabel("PO_CREATED")).toBe("PO Created");
  });
});

describe("prStatusBadge — badge classes by status", () => {
  it("PENDING_APPROVAL badge is amber", () => {
    expect(prStatusBadge("PENDING_APPROVAL")).toContain("amber");
  });
  it("APPROVED badge is green", () => {
    expect(prStatusBadge("APPROVED")).toContain("green");
  });
  it("REJECTED badge is red", () => {
    expect(prStatusBadge("REJECTED")).toContain("red");
  });
  it("DRAFT badge is gray", () => {
    expect(prStatusBadge("DRAFT")).toContain("gray");
  });
  it("PO_CREATED badge is blue", () => {
    expect(prStatusBadge("PO_CREATED")).toContain("blue");
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe("requisitionApi error handling", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("throws 401 on unauthenticated", async () => {
    mockHttpError(401, "Unauthorized");
    await expect(requisitionApi.listByRequester("emp-001")).rejects.toMatchObject({ status: 401 });
  });

  it("throws 403 on forbidden", async () => {
    mockHttpError(403, "Forbidden");
    await expect(requisitionApi.submit(1)).rejects.toMatchObject({ status: 403 });
  });
});
