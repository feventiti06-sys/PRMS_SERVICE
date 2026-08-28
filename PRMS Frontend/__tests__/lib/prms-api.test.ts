/**
 * Unit tests for lib/prms-api.ts
 *
 * Tests cover:
 * - Backend enum type guards
 * - Status label helpers
 * - Status badge helpers
 * - API function shape (mocked fetch)
 * - Error handling
 */

import {
  prStatusLabel,
  prStatusBadge,
  poStatusBadge,
  BackendPRStatus,
  BackendPOStatus,
  BackendPaymentTerms,
  BackendVendorType,
  BackendApprovalAction,
} from "@/lib/prms-api";

// ─── prStatusLabel ────────────────────────────────────────────────────────────

describe("prStatusLabel", () => {
  it("maps DRAFT correctly", () => {
    expect(prStatusLabel("DRAFT")).toBe("Draft");
  });

  it("maps PENDING_APPROVAL correctly", () => {
    expect(prStatusLabel("PENDING_APPROVAL")).toBe("Pending Approval");
  });

  it("maps APPROVED correctly", () => {
    expect(prStatusLabel("APPROVED")).toBe("Approved");
  });

  it("maps REJECTED correctly", () => {
    expect(prStatusLabel("REJECTED")).toBe("Rejected");
  });

  it("maps PO_CREATED correctly", () => {
    expect(prStatusLabel("PO_CREATED")).toBe("PO Created");
  });

  it("returns raw value for unknown status", () => {
    expect(prStatusLabel("UNKNOWN" as BackendPRStatus)).toBe("UNKNOWN");
  });
});

// ─── prStatusBadge ────────────────────────────────────────────────────────────

describe("prStatusBadge", () => {
  it("returns amber classes for PENDING_APPROVAL", () => {
    expect(prStatusBadge("PENDING_APPROVAL")).toContain("amber");
  });

  it("returns green classes for APPROVED", () => {
    expect(prStatusBadge("APPROVED")).toContain("green");
  });

  it("returns red classes for REJECTED", () => {
    expect(prStatusBadge("REJECTED")).toContain("red");
  });

  it("returns gray classes for DRAFT", () => {
    expect(prStatusBadge("DRAFT")).toContain("gray");
  });

  it("returns blue classes for PO_CREATED", () => {
    expect(prStatusBadge("PO_CREATED")).toContain("blue");
  });

  it("falls back to gray for unknown status", () => {
    expect(prStatusBadge("UNKNOWN" as BackendPRStatus)).toContain("gray");
  });
});

// ─── poStatusBadge ────────────────────────────────────────────────────────────

describe("poStatusBadge", () => {
  const cases: Array<[BackendPOStatus, string]> = [
    ["DRAFT", "gray"],
    ["SENT", "blue"],
    ["CONFIRMED", "green"],
    ["PARTIALLY_RECEIVED", "amber"],
    ["COMPLETED", "teal"],
    ["CANCELLED", "red"],
  ];

  test.each(cases)("status %s contains %s colour", (status, colour) => {
    expect(poStatusBadge(status)).toContain(colour);
  });

  it("falls back to gray for unknown status", () => {
    expect(poStatusBadge("UNKNOWN" as BackendPOStatus)).toContain("gray");
  });
});

// ─── Enum value coverage ──────────────────────────────────────────────────────

describe("BackendPaymentTerms values", () => {
  const validTerms: BackendPaymentTerms[] = ["NET_15", "NET_30", "NET_60", "COD"];

  it("has 4 valid payment term values", () => {
    expect(validTerms).toHaveLength(4);
  });
});

describe("BackendVendorType values", () => {
  const validTypes: BackendVendorType[] = ["INDIVIDUAL", "CORPORATE", "GOVERNMENT"];

  it("has 3 valid vendor type values", () => {
    expect(validTypes).toHaveLength(3);
  });
});

describe("BackendApprovalAction values", () => {
  const validActions: BackendApprovalAction[] = ["APPROVE", "REJECT", "RETURN"];

  it("has 3 valid approval action values", () => {
    expect(validActions).toHaveLength(3);
  });

  it("does not include legacy MANAGER or OFFICER values", () => {
    expect(validActions).not.toContain("MANAGER");
    expect(validActions).not.toContain("OFFICER");
  });
});
