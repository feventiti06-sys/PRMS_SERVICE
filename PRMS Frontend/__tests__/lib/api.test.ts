/**
 * Unit tests for lib/api.ts
 *
 * Tests cover:
 * - handleApiError returns correct message for each HTTP status
 * - isApiError correctly identifies ApiError objects
 * - API_CONFIG reads NEXT_PUBLIC_API_BASE_URL
 * - Query key shapes are consistent
 */

import { handleApiError, isApiError, API_CONFIG, queryKeys, ApiError, apiClient } from "@/lib/api";

// ─── handleApiError ───────────────────────────────────────────────────────────

describe("handleApiError", () => {
  const makeError = (status: number, message = "Error", errors?: string[]): ApiError => ({
    status,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });

  it("returns 'Invalid request data' for 400 with no errors array", () => {
    expect(handleApiError(makeError(400))).toBe("Invalid request data");
  });

  it("returns joined errors array for 400 when errors present", () => {
    expect(handleApiError(makeError(400, "Bad", ["field required", "invalid format"]))).toBe(
      "field required, invalid format"
    );
  });

  it("returns 'Authentication required' for 401", () => {
    expect(handleApiError(makeError(401))).toBe("Authentication required");
  });

  it("returns 'Access denied' for 403", () => {
    expect(handleApiError(makeError(403))).toBe("Access denied");
  });

  it("returns 'Resource not found' for 404", () => {
    expect(handleApiError(makeError(404))).toBe("Resource not found");
  });

  it("returns 'Resource conflict' for 409", () => {
    expect(handleApiError(makeError(409))).toBe("Resource conflict");
  });

  it("returns joined errors for 422 when errors present", () => {
    expect(handleApiError(makeError(422, "Validation failed", ["name required"]))).toBe(
      "name required"
    );
  });

  it("returns 'Validation failed' for 422 with no errors array", () => {
    expect(handleApiError(makeError(422))).toBe("Validation failed");
  });

  it("returns 'Server error occurred' for 500", () => {
    expect(handleApiError(makeError(500))).toBe("Server error occurred");
  });

  it("returns 'Service temporarily unavailable' for 503", () => {
    expect(handleApiError(makeError(503))).toBe("Service temporarily unavailable");
  });

  it("returns message for unrecognised status code", () => {
    expect(handleApiError(makeError(418, "I'm a teapot"))).toBe("I'm a teapot");
  });
});

// ─── isApiError ───────────────────────────────────────────────────────────────

describe("isApiError", () => {
  it("returns true for a valid ApiError shape", () => {
    const err: ApiError = { status: 401, message: "Unauthorized", timestamp: "" };
    expect(isApiError(err)).toBe(true);
  });

  it("returns false for a plain Error object", () => {
    expect(isApiError(new Error("oops"))).toBe(false);
  });

  it("returns false for null", () => {
    expect(isApiError(null)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isApiError("something went wrong")).toBe(false);
  });

  it("returns false when status is a string (not number)", () => {
    expect(isApiError({ status: "401", message: "bad" })).toBe(false);
  });
});

// ─── API_CONFIG ───────────────────────────────────────────────────────────────

describe("API_CONFIG", () => {
  it("baseUrl falls back to localhost when env var not set", () => {
    // In test environment NEXT_PUBLIC_API_BASE_URL is not set
    expect(API_CONFIG.baseUrl).toMatch(/localhost/);
  });

  it("timeout is at least 10 seconds", () => {
    expect(API_CONFIG.timeout).toBeGreaterThanOrEqual(10000);
  });

  it("retries is a positive number", () => {
    expect(API_CONFIG.retries).toBeGreaterThan(0);
  });
});

// ─── queryKeys ────────────────────────────────────────────────────────────────

describe("queryKeys", () => {
  it("suppliers key is a tuple starting with 'suppliers'", () => {
    expect(queryKeys.suppliers[0]).toBe("suppliers");
  });

  it("supplier(id) key includes the id", () => {
    expect(queryKeys.supplier("42")).toContain("42");
  });

  it("purchaseRequests key is a tuple starting with 'purchase-requests'", () => {
    expect(queryKeys.purchaseRequests[0]).toBe("purchase-requests");
  });

  it("purchaseRequest(id) key includes the id", () => {
    expect(queryKeys.purchaseRequest("7")).toContain("7");
  });

  it("approvals key is a tuple starting with 'approvals'", () => {
    expect(queryKeys.approvals[0]).toBe("approvals");
  });

  it("rfqs key is a tuple starting with 'rfqs'", () => {
    expect(queryKeys.rfqs[0]).toBe("rfqs");
  });

  it("purchaseOrders key is a tuple starting with 'purchase-orders'", () => {
    expect(queryKeys.purchaseOrders[0]).toBe("purchase-orders");
  });

  it("goodsReceipts key is a tuple starting with 'goods-receipts'", () => {
    expect(queryKeys.goodsReceipts[0]).toBe("goods-receipts");
  });

  it("invoices key is a tuple starting with 'invoices'", () => {
    expect(queryKeys.invoices[0]).toBe("invoices");
  });
});

// ─── apiClient — Spring Boot response shapes ─────────────────────────────────

describe("apiClient Spring Boot integration", () => {
  const mockFetch = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockFetch.mockClear();
    global.fetch = mockFetch;
    Object.defineProperty(global, "localStorage", {
      value: { getItem: () => null, setItem: jest.fn(), removeItem: jest.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("unwraps raw JSON array responses into ApiResponse.data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => [{ id: 1, name: "Vendor A" }],
    } as unknown as Response);

    const response = await apiClient.get<{ id: number; name: string }[]>("/vendors");
    expect(response.success).toBe(true);
    expect(response.data).toHaveLength(1);
    expect(response.data[0].name).toBe("Vendor A");
  });

  it("parses Spring ProblemDetail errors using detail field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: { get: () => "application/problem+json" },
      json: async () => ({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "Requisition not found",
      }),
    } as unknown as Response);

    await expect(apiClient.get("/requisitions/999")).rejects.toMatchObject({
      status: 404,
      message: "Requisition not found",
    });
  });
});
