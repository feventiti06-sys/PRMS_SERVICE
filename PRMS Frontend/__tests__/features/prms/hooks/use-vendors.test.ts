/**
 * Unit tests for features/prms/hooks/use-vendors.ts
 *
 * Tests cover:
 * - vendorApi.list() calls the correct endpoint
 * - vendorApi.getById() calls the correct endpoint
 * - vendorApi.create() sends the correct body
 * - Error handling on 401/403/500
 */

import { vendorApi, VendorCreateRequest } from "@/lib/prms-api";
import { handleApiError, isApiError } from "@/lib/api";

// ── Mock fetch globally ────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
Object.defineProperty(global, "localStorage", {
  value: { getItem: () => "mock-jwt-token", setItem: jest.fn(), removeItem: jest.fn() },
  writable: true,
});

// ── Helpers ────────────────────────────────────────────────────────────────

function mockSuccess<T>(data: T) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => ({ success: true, data }),
  } as unknown as Response);
}

function mockRawSuccess<T>(data: T) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => data,
  } as unknown as Response);
}

function mockHttpError(status: number, message: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    headers: { get: () => "application/json" },
    json: async () => ({ message }),
  } as unknown as Response);
}

const MOCK_VENDOR = {
  id: 1,
  vendorCode: "VND-001",
  name: "Ethio Tech Solutions",
  vendorType: "CORPORATE" as const,
  taxIdentificationNumber: "0014-578-200",
  email: "info@ethiotech.et",
  phone: "+251 911 111 222",
  address: "Addis Ababa",
  paymentTerms: "NET_30" as const,
  blacklisted: false,
  performanceScore: 4.8,
};

// ─── vendorApi.list ───────────────────────────────────────────────────────────

describe("vendorApi.list", () => {
  beforeEach(() => mockFetch.mockClear());

  it("calls GET /vendors endpoint", async () => {
    mockSuccess([MOCK_VENDOR]);
    await vendorApi.list();
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/vendors");
    expect(mockFetch.mock.calls[0][1]?.method).toBeUndefined(); // GET has no method override
  });

  it("includes Authorization header with Bearer token", async () => {
    mockSuccess([MOCK_VENDOR]);
    await vendorApi.list();
    const headers = mockFetch.mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers?.Authorization).toMatch(/^Bearer /);
  });

  it("returns an array of VendorResponse", async () => {
    mockSuccess([MOCK_VENDOR]);
    const result = await vendorApi.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].name).toBe("Ethio Tech Solutions");
    expect(result[0].vendorCode).toBe("VND-001");
  });
});

// ─── vendorApi.getById ────────────────────────────────────────────────────────

describe("vendorApi.getById", () => {
  beforeEach(() => mockFetch.mockClear());

  it("calls GET /vendors/{id} with correct ID", async () => {
    mockSuccess(MOCK_VENDOR);
    await vendorApi.getById(1);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/vendors/1");
  });

  it("returns a single VendorResponse", async () => {
    mockSuccess(MOCK_VENDOR);
    const result = await vendorApi.getById(1);
    expect(result.id).toBe(1);
    expect(result.paymentTerms).toBe("NET_30");
  });
});

// ─── vendorApi.create ─────────────────────────────────────────────────────────

describe("vendorApi.create", () => {
  beforeEach(() => mockFetch.mockClear());

  const body: VendorCreateRequest = {
    name: "New Supplier Ltd.",
    vendorType: "CORPORATE",
    taxIdentificationNumber: "0014-999-000",
    email: "contact@newsupplier.et",
    phone: "+251 911 000 001",
    address: "Addis Ababa",
    paymentTerms: "NET_30",
  };

  it("calls POST /vendors endpoint", async () => {
    mockSuccess({ ...MOCK_VENDOR, id: 99, name: body.name });
    await vendorApi.create(body);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/vendors");
    expect(mockFetch.mock.calls[0][1]?.method).toBe("POST");
  });

  it("sends the correct JSON body", async () => {
    mockSuccess({ ...MOCK_VENDOR, id: 99, name: body.name });
    await vendorApi.create(body);
    const sentBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(sentBody.name).toBe("New Supplier Ltd.");
    expect(sentBody.vendorType).toBe("CORPORATE");
    expect(sentBody.paymentTerms).toBe("NET_30");
  });

  it("returns the created VendorResponse", async () => {
    mockSuccess({ ...MOCK_VENDOR, id: 99, name: body.name });
    const result = await vendorApi.create(body);
    expect(result.name).toBe("New Supplier Ltd.");
  });
  it("returns vendor list when backend returns raw JSON array (Spring Boot)", async () => {
    mockRawSuccess([MOCK_VENDOR]);
    const result = await vendorApi.list();
    expect(result[0].name).toBe("Ethio Tech Solutions");
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────
// Note: ApiClient has retry logic with exponential backoff for 5xx errors.
// We use jest.useFakeTimers() to make the retry delays instant.

describe("vendorApi error handling", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("throws ApiError with status 401 on unauthenticated request", async () => {
    mockHttpError(401, "Unauthorized");
    // 401 is NOT retried (only 5xx triggers retry), so no fake timers needed
    jest.useRealTimers();
    await expect(vendorApi.list()).rejects.toMatchObject({ status: 401 });
  });

  it("throws ApiError with status 403 on forbidden request", async () => {
    mockHttpError(403, "Forbidden");
    jest.useRealTimers();
    await expect(vendorApi.getById(1)).rejects.toMatchObject({ status: 403 });
  });

  it("throws ApiError with status 500 on server error after retries", async () => {
    jest.useRealTimers();
    // Mock all calls (1 initial + 3 retries) to return 500
    mockHttpError(500, "Internal Server Error");
    mockHttpError(500, "Internal Server Error");
    mockHttpError(500, "Internal Server Error");
    mockHttpError(500, "Internal Server Error");

    await expect(vendorApi.list()).rejects.toMatchObject({ status: 500 });
  }, 30000);

  it("isApiError correctly identifies thrown errors", async () => {
    mockHttpError(404, "Not Found");
    jest.useRealTimers();
    try {
      await vendorApi.getById(999);
    } catch (err) {
      expect(isApiError(err)).toBe(true);
      expect(handleApiError(err as any)).toBe("Resource not found");
    }
  });
});
