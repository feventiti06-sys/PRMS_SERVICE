/**
 * Unit tests for features/auth/types/roles.ts
 *
 * Tests cover:
 * - ROLES constant values match exactly what the backend expects
 * - getRoleDisplayName returns correct labels
 * - hasRole / hasAnyRole logic
 * - isRouteAllowed access matrix
 * - ROLE_ALLOWED_ROUTES completeness
 */

import {
  ROLES,
  getRoleDisplayName,
  hasRole,
  hasAnyRole,
  isRouteAllowed,
  ROLE_ALLOWED_ROUTES,
  type PRMSRole,
} from "@/features/auth/types/roles";

// ─── ROLES constants ──────────────────────────────────────────────────────────

describe("ROLES constants", () => {
  it("PROCUREMENT_ADMIN is the exact string 'PROCUREMENT_ADMIN'", () => {
    expect(ROLES.PROCUREMENT_ADMIN).toBe("PROCUREMENT_ADMIN");
  });

  it("REQUESTER is the exact string 'REQUESTER'", () => {
    expect(ROLES.REQUESTER).toBe("REQUESTER");
  });

  it("SUPPLIER is the exact string 'SUPPLIER'", () => {
    expect(ROLES.SUPPLIER).toBe("SUPPLIER");
  });

  it("does NOT contain old role ADMIN", () => {
    expect(Object.values(ROLES)).not.toContain("ADMIN");
  });

  it("does NOT contain old role MANAGER", () => {
    expect(Object.values(ROLES)).not.toContain("MANAGER");
  });

  it("does NOT contain old role OFFICER", () => {
    expect(Object.values(ROLES)).not.toContain("OFFICER");
  });

  it("has exactly 3 roles", () => {
    expect(Object.values(ROLES)).toHaveLength(3);
  });
});

// ─── getRoleDisplayName ───────────────────────────────────────────────────────

describe("getRoleDisplayName", () => {
  it("formats PROCUREMENT_ADMIN as 'Procurement Admin'", () => {
    expect(getRoleDisplayName(ROLES.PROCUREMENT_ADMIN)).toBe("Procurement Admin");
  });

  it("formats REQUESTER as 'Requester'", () => {
    expect(getRoleDisplayName(ROLES.REQUESTER)).toBe("Requester");
  });

  it("formats SUPPLIER as 'Supplier'", () => {
    expect(getRoleDisplayName(ROLES.SUPPLIER)).toBe("Supplier");
  });

  it("returns raw string for unknown role", () => {
    expect(getRoleDisplayName("UNKNOWN")).toBe("UNKNOWN");
  });
});

// ─── hasRole ─────────────────────────────────────────────────────────────────

describe("hasRole", () => {
  it("returns true when role matches required role", () => {
    expect(hasRole(ROLES.PROCUREMENT_ADMIN, ROLES.PROCUREMENT_ADMIN)).toBe(true);
  });

  it("returns false when role does not match", () => {
    expect(hasRole(ROLES.REQUESTER, ROLES.PROCUREMENT_ADMIN)).toBe(false);
  });

  it("returns false for null role", () => {
    expect(hasRole(null, ROLES.PROCUREMENT_ADMIN)).toBe(false);
  });

  it("returns false for undefined role", () => {
    expect(hasRole(undefined, ROLES.REQUESTER)).toBe(false);
  });
});

// ─── hasAnyRole ───────────────────────────────────────────────────────────────

describe("hasAnyRole", () => {
  it("returns true when role is in allowed list", () => {
    expect(hasAnyRole(ROLES.REQUESTER, [ROLES.PROCUREMENT_ADMIN, ROLES.REQUESTER])).toBe(true);
  });

  it("returns false when role is NOT in allowed list", () => {
    expect(hasAnyRole(ROLES.SUPPLIER, [ROLES.PROCUREMENT_ADMIN, ROLES.REQUESTER])).toBe(false);
  });

  it("returns false for null role", () => {
    expect(hasAnyRole(null, [ROLES.PROCUREMENT_ADMIN])).toBe(false);
  });

  it("returns false for empty allowed list", () => {
    expect(hasAnyRole(ROLES.PROCUREMENT_ADMIN, [])).toBe(false);
  });
});

// ─── isRouteAllowed ───────────────────────────────────────────────────────────

describe("isRouteAllowed", () => {
  // PROCUREMENT_ADMIN
  it("allows PROCUREMENT_ADMIN to access /prms/suppliers", () => {
    expect(isRouteAllowed(ROLES.PROCUREMENT_ADMIN, "/prms/suppliers")).toBe(true);
  });

  it("allows PROCUREMENT_ADMIN to access /prms/settings", () => {
    expect(isRouteAllowed(ROLES.PROCUREMENT_ADMIN, "/prms/settings")).toBe(true);
  });

  it("allows PROCUREMENT_ADMIN to access /prms/audit", () => {
    expect(isRouteAllowed(ROLES.PROCUREMENT_ADMIN, "/prms/audit")).toBe(true);
  });

  // REQUESTER restrictions
  it("allows REQUESTER to access /prms/purchase-requests", () => {
    expect(isRouteAllowed(ROLES.REQUESTER, "/prms/purchase-requests")).toBe(true);
  });

  it("BLOCKS REQUESTER from /prms/suppliers", () => {
    expect(isRouteAllowed(ROLES.REQUESTER, "/prms/suppliers")).toBe(false);
  });

  it("BLOCKS REQUESTER from /prms/approvals", () => {
    expect(isRouteAllowed(ROLES.REQUESTER, "/prms/approvals")).toBe(false);
  });

  it("BLOCKS REQUESTER from /prms/settings", () => {
    expect(isRouteAllowed(ROLES.REQUESTER, "/prms/settings")).toBe(false);
  });

  it("BLOCKS REQUESTER from /prms/reports", () => {
    expect(isRouteAllowed(ROLES.REQUESTER, "/prms/reports")).toBe(false);
  });

  it("BLOCKS REQUESTER from /prms/audit", () => {
    expect(isRouteAllowed(ROLES.REQUESTER, "/prms/audit")).toBe(false);
  });

  // SUPPLIER restrictions
  it("allows SUPPLIER to access /prms/rfq", () => {
    expect(isRouteAllowed(ROLES.SUPPLIER, "/prms/rfq")).toBe(true);
  });

  it("allows SUPPLIER to access /prms/invoices", () => {
    expect(isRouteAllowed(ROLES.SUPPLIER, "/prms/invoices")).toBe(true);
  });

  it("BLOCKS SUPPLIER from /prms/suppliers (internal admin page)", () => {
    expect(isRouteAllowed(ROLES.SUPPLIER, "/prms/suppliers")).toBe(false);
  });

  it("BLOCKS SUPPLIER from /prms/approvals", () => {
    expect(isRouteAllowed(ROLES.SUPPLIER, "/prms/approvals")).toBe(false);
  });

  it("BLOCKS SUPPLIER from /prms/purchase-requests", () => {
    expect(isRouteAllowed(ROLES.SUPPLIER, "/prms/purchase-requests")).toBe(false);
  });

  it("BLOCKS SUPPLIER from /prms/reports", () => {
    expect(isRouteAllowed(ROLES.SUPPLIER, "/prms/reports")).toBe(false);
  });

  it("BLOCKS SUPPLIER from /prms/audit", () => {
    expect(isRouteAllowed(ROLES.SUPPLIER, "/prms/audit")).toBe(false);
  });

  // Sub-path matching
  it("allows sub-paths e.g. /prms/purchase-requests/new for REQUESTER", () => {
    expect(isRouteAllowed(ROLES.REQUESTER, "/prms/purchase-requests/new")).toBe(true);
  });

  it("allows sub-paths e.g. /prms/purchase-requests/123 for REQUESTER", () => {
    expect(isRouteAllowed(ROLES.REQUESTER, "/prms/purchase-requests/123")).toBe(true);
  });

  // Null/unknown role
  it("returns false for null role", () => {
    expect(isRouteAllowed(null, "/prms")).toBe(false);
  });

  it("returns false for unknown role string", () => {
    expect(isRouteAllowed("UNKNOWN", "/prms/suppliers")).toBe(false);
  });
});

// ─── ROLE_ALLOWED_ROUTES completeness ────────────────────────────────────────

describe("ROLE_ALLOWED_ROUTES", () => {
  it("PROCUREMENT_ADMIN has all 14 routes", () => {
    expect(ROLE_ALLOWED_ROUTES.PROCUREMENT_ADMIN.length).toBeGreaterThanOrEqual(14);
  });

  it("REQUESTER has exactly 2 routes (dashboard + purchase-requests)", () => {
    expect(ROLE_ALLOWED_ROUTES.REQUESTER).toHaveLength(2);
  });

  it("SUPPLIER has exactly 7 routes", () => {
    expect(ROLE_ALLOWED_ROUTES.SUPPLIER).toHaveLength(7);
  });

  it("every role has /prms (dashboard) in allowed routes", () => {
    const allRoles: PRMSRole[] = [ROLES.PROCUREMENT_ADMIN, ROLES.REQUESTER, ROLES.SUPPLIER];
    allRoles.forEach((role) => {
      expect(ROLE_ALLOWED_ROUTES[role]).toContain("/prms");
    });
  });
});
