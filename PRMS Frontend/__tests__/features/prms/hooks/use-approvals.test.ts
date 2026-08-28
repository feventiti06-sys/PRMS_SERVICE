/**
 * Unit tests for the approval API layer (approvalApi in prms-api.ts)
 *
 * Tests cover:
 * - decideOnRequisition() calls correct endpoint
 * - APPROVE / REJECT / RETURN actions are sent correctly
 * - comments field is optional
 * - 401/403 handled
 */

import { approvalApi, BackendApprovalAction } from "@/lib/prms-api";

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

function mockHttpError(status: number) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: "Error",
    headers: { get: () => "application/json" },
    json: async () => ({ message: "Error" }),
  } as unknown as Response);
}

const MOCK_UPDATED = {
  id: 5,
  requisitionNumber: "REQ-2024-00005",
  requesterEmployeeId: "emp-001",
  departmentCode: "IT",
  purpose: "Network upgrade",
  itemDetails: "Cisco switches",
  estimatedAmount: 250000,
  status: "APPROVED" as const,
  requiredByDate: "2024-06-30",
  approvalWorkflowId: 1,
  createdAt: "2024-01-15T09:00:00Z",
};

describe("approvalApi.decideOnRequisition", () => {
  beforeEach(() => mockFetch.mockClear());

  it("calls POST /approvals/requisitions/{id}", async () => {
    mockSuccess(MOCK_UPDATED);
    await approvalApi.decideOnRequisition(5, { action: "APPROVE" });
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/approvals/requisitions/5");
    expect(mockFetch.mock.calls[0][1]?.method).toBe("POST");
  });

  const actions: BackendApprovalAction[] = ["APPROVE", "REJECT", "RETURN"];

  test.each(actions)("sends action '%s' in request body", async (action) => {
    mockSuccess({ ...MOCK_UPDATED, status: action === "APPROVE" ? "APPROVED" : "REJECTED" });
    await approvalApi.decideOnRequisition(5, { action });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.action).toBe(action);
  });

  it("includes comments when provided", async () => {
    mockSuccess(MOCK_UPDATED);
    await approvalApi.decideOnRequisition(5, {
      action: "REJECT",
      comments: "Budget exceeded",
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.comments).toBe("Budget exceeded");
  });

  it("omits comments when not provided", async () => {
    mockSuccess(MOCK_UPDATED);
    await approvalApi.decideOnRequisition(5, { action: "APPROVE" });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.comments).toBeUndefined();
  });

  it("throws 401 when not authenticated", async () => {
    mockHttpError(401);
    // 401 is not retried
    await expect(
      approvalApi.decideOnRequisition(5, { action: "APPROVE" })
    ).rejects.toMatchObject({ status: 401 });
  });

  it("throws 403 when user lacks PROCUREMENT_ADMIN role", async () => {
    mockHttpError(403);
    await expect(
      approvalApi.decideOnRequisition(5, { action: "APPROVE" })
    ).rejects.toMatchObject({ status: 403 });
  });

  it("does not send MANAGER or OFFICER in the action field", async () => {
    mockSuccess(MOCK_UPDATED);
    await approvalApi.decideOnRequisition(5, { action: "APPROVE" });
    const body = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
    expect(body.action).not.toBe("MANAGER");
    expect(body.action).not.toBe("OFFICER");
  });
});
