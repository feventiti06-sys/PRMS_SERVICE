/**
 * PRMS Auth Service — Development Placeholder
 *
 * This service provides helper utilities for the PRMS frontend's temporary
 * development login flow.  It is NOT the production authentication mechanism.
 *
 * Production authentication is owned by the shared ERP / Keycloak team.
 * When their integration is ready, this service's login/logout methods
 * should be replaced with calls to their auth endpoints.
 *
 * The three official PRMS roles (as agreed with the shared auth team) are:
 *   • PROCUREMENT_ADMIN
 *   • REQUESTER
 *   • SUPPLIER
 */

import {
  ROLES,
  type PRMSRole,
  type AuthenticatedUser,
} from "@/features/auth/types/roles";

// ─── Shared types (re-exported for convenience) ───────────────────────────────

export type { PRMSRole, AuthenticatedUser };

export interface PRMSDevSession {
  user: AuthenticatedUser;
  role: PRMSRole;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  DEV PLACEHOLDER CREDENTIALS
//  These are used ONLY for local UI development so the three PRMS roles can
//  be tested without a live Keycloak server.
//  Remove / replace when the shared ERP auth integration is available.
// ─────────────────────────────────────────────────────────────────────────────

interface DevUser {
  credentials: { username: string; password: string };
  user: AuthenticatedUser;
  role: PRMSRole;
}

const DEV_USERS: DevUser[] = [
  {
    credentials: { username: "procurement_admin", password: "admin123" },
    user: {
      id: "dev-1",
      username: "procurement_admin",
      firstName: "Procurement",
      lastName: "Admin",
      displayName: "Procurement Admin",
      email: "procurement.admin@insa.edu.et",
    },
    role: ROLES.PROCUREMENT_ADMIN,
  },
  {
    credentials: { username: "requester", password: "requester123" },
    user: {
      id: "dev-2",
      username: "requester",
      firstName: "Abebe",
      lastName: "Kebede",
      displayName: "Abebe Kebede",
      email: "abebe.kebede@insa.edu.et",
    },
    role: ROLES.REQUESTER,
  },
  {
    credentials: { username: "supplier", password: "supplier123" },
    user: {
      id: "dev-3",
      username: "supplier",
      firstName: "Tigist",
      lastName: "Haile",
      displayName: "Tigist Haile",
      email: "tigist.haile@supplier.com",
    },
    role: ROLES.SUPPLIER,
  },
];

// ─── Service ──────────────────────────────────────────────────────────────────

export class AuthService {
  /**
   * Development-only login.
   * Validates against the DEV_USERS list and writes a session object to
   * localStorage under "prms_dev_session" so AuthProvider can pick it up.
   *
   * REPLACE with Keycloak / shared ERP auth call in production.
   */
  async devLogin(username: string, password: string): Promise<ApiResponse<PRMSDevSession>> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const match = DEV_USERS.find(
      (u) => u.credentials.username === username && u.credentials.password === password
    );

    if (!match) {
      return {
        success: false,
        data: {} as PRMSDevSession,
        error: { message: "Invalid username or password", code: "INVALID_CREDENTIALS" },
      };
    }

    const session: PRMSDevSession = { user: match.user, role: match.role };
    this.saveDevSession(session);

    return { success: true, data: session };
  }

  /** Clears the development session from localStorage. */
  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("prms_dev_session");
      // Clear legacy keys from the old login page
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }

  // ─── Session helpers ────────────────────────────────────────────────────────

  private saveDevSession(session: PRMSDevSession): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("prms_dev_session", JSON.stringify(session));
      // Write legacy "isAuthenticated" key so the old dashboard layout guard
      // continues to work until it is refactored.
      localStorage.setItem("isAuthenticated", "true");
    }
  }

  getDevSession(): PRMSDevSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("prms_dev_session");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<PRMSDevSession>;
      if (!parsed?.user || !parsed?.role) return null;
      if (!Object.values(ROLES).includes(parsed.role as PRMSRole)) return null;
      return parsed as PRMSDevSession;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getDevSession() !== null;
  }

  /** Returns the dev user's role, or null if not authenticated. */
  getRole(): PRMSRole | null {
    return this.getDevSession()?.role ?? null;
  }

  /** Returns the dev user, or null if not authenticated. */
  getUser(): AuthenticatedUser | null {
    return this.getDevSession()?.user ?? null;
  }

  /** Returns the list of dev placeholder users (for the dev login hint UI). */
  getDevCredentials() {
    return DEV_USERS.map((u) => ({
      username: u.credentials.username,
      password: u.credentials.password,
      role: u.role,
    }));
  }
}

export const authService = new AuthService();
