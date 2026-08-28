/**
 * Unit tests for features/auth/services/auth-service.ts
 *
 * Tests cover:
 * - devLogin with correct credentials returns the right role
 * - devLogin with wrong credentials returns error
 * - getRole / getUser / isAuthenticated after login
 * - Only PRMS roles present — no ADMIN/MANAGER/OFFICER
 * - logout clears session
 */

import { AuthService } from "@/features/auth/services/auth-service";
import { ROLES } from "@/features/auth/types/roles";

// Mock localStorage for Node/Jest environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Use fake timers to skip the 800ms simulated delay in devLogin()
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// Helper: run devLogin while advancing fake timers past the 800ms delay
async function loginWith(service: AuthService, username: string, password: string) {
  const promise = service.devLogin(username, password);
  await jest.runAllTimersAsync();
  return promise;
}

describe("AuthService — dev login", () => {
  let service: AuthService;

  beforeEach(() => {
    localStorageMock.clear();
    service = new AuthService();
  });

  // ── Successful logins ────────────────────────────────────────────────────

  it("PROCUREMENT_ADMIN login succeeds with correct credentials", async () => {
    const result = await loginWith(service, "procurement_admin", "admin123");
    expect(result.success).toBe(true);
    expect(result.data.role).toBe(ROLES.PROCUREMENT_ADMIN);
  });

  it("REQUESTER login succeeds with correct credentials", async () => {
    const result = await loginWith(service, "requester", "requester123");
    expect(result.success).toBe(true);
    expect(result.data.role).toBe(ROLES.REQUESTER);
  });

  it("SUPPLIER login succeeds with correct credentials", async () => {
    const result = await loginWith(service, "supplier", "supplier123");
    expect(result.success).toBe(true);
    expect(result.data.role).toBe(ROLES.SUPPLIER);
  });

  // ── Failed logins ────────────────────────────────────────────────────────

  it("returns error for wrong password", async () => {
    const result = await loginWith(service, "procurement_admin", "wrongpassword");
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns error for unknown username", async () => {
    const result = await loginWith(service, "admin", "admin123");
    expect(result.success).toBe(false);
  });

  it("rejects old ADMIN username (not a valid PRMS role)", async () => {
    const result = await loginWith(service, "admin", "admin123");
    expect(result.success).toBe(false);
  });

  it("rejects old MANAGER username", async () => {
    const result = await loginWith(service, "manager", "manager123");
    expect(result.success).toBe(false);
  });

  it("rejects old OFFICER username", async () => {
    const result = await loginWith(service, "officer", "officer123");
    expect(result.success).toBe(false);
  });

  // ── Session state after login ────────────────────────────────────────────

  it("isAuthenticated returns true after successful login", async () => {
    await loginWith(service, "requester", "requester123");
    expect(service.isAuthenticated()).toBe(true);
  });

  it("getRole returns correct role after login", async () => {
    await loginWith(service, "supplier", "supplier123");
    expect(service.getRole()).toBe(ROLES.SUPPLIER);
  });

  it("getUser returns user with correct username after login", async () => {
    await loginWith(service, "procurement_admin", "admin123");
    const user = service.getUser();
    expect(user?.username).toBe("procurement_admin");
  });

  it("getUser returns displayName after login", async () => {
    await loginWith(service, "requester", "requester123");
    const user = service.getUser();
    expect(user?.displayName).toBeTruthy();
  });

  // ── Logout ───────────────────────────────────────────────────────────────

  it("isAuthenticated returns false after logout", async () => {
    await loginWith(service, "procurement_admin", "admin123");
    expect(service.isAuthenticated()).toBe(true);
    await service.logout();
    expect(service.isAuthenticated()).toBe(false);
  });

  it("getRole returns null after logout", async () => {
    await loginWith(service, "supplier", "supplier123");
    await service.logout();
    expect(service.getRole()).toBeNull();
  });

  // ── Dev credentials listing ───────────────────────────────────────────────

  it("getDevCredentials returns 3 entries", () => {
    const creds = service.getDevCredentials();
    expect(creds).toHaveLength(3);
  });

  it("getDevCredentials contains only valid PRMS roles", () => {
    const validRoles = Object.values(ROLES);
    service.getDevCredentials().forEach((cred) => {
      expect(validRoles).toContain(cred.role);
    });
  });

  it("getDevCredentials does not contain old ADMIN/MANAGER/OFFICER roles", () => {
    const roles = service.getDevCredentials().map((c) => c.role);
    expect(roles).not.toContain("ADMIN");
    expect(roles).not.toContain("MANAGER");
    expect(roles).not.toContain("OFFICER");
  });
});
