"use client";

/**
 * PRMS Auth Context
 *
 * This context defines the INTERFACE between the PRMS frontend and the shared
 * ERP authentication / Keycloak system owned by another team.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Shared ERP Login → Keycloak → Authenticated User + Role        │
 * │        ↓                                                        │
 * │  AuthProvider (this file) → PRMS Frontend role-based access     │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * INTEGRATION NOTE:
 *   When the shared auth team delivers the Keycloak integration, replace the
 *   DEV_PLACEHOLDER section below with a call to their session hook / token
 *   endpoint.  The rest of the PRMS frontend consumes `useAuth()` and will
 *   work unchanged.
 *
 * DO NOT add a competing authentication system here.
 * DO NOT store passwords or implement JWT signing here.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { type PRMSRole, type AuthenticatedUser, ROLES } from "@/features/auth/types/roles";

// ─── Context contract ─────────────────────────────────────────────────────────

export interface AuthContextValue {
  /** The authenticated user supplied by the shared ERP auth system. */
  user: AuthenticatedUser | null;
  /** The PRMS role supplied by the shared ERP auth system. */
  role: PRMSRole | null;
  /** True once the auth state has been resolved (avoids flash of unauthenticated UI). */
  isLoading: boolean;
  /** True when a valid authenticated session exists. */
  isAuthenticated: boolean;
  /**
   * Checks whether the current user holds the given role.
   * Designed to be driven by the role supplied by the shared auth system.
   */
  hasRole: (role: PRMSRole) => boolean;
  /**
   * Checks whether the current user holds any of the given roles.
   */
  hasAnyRole: (roles: PRMSRole[]) => boolean;
  /**
   * Logout — will delegate to the shared ERP auth/Keycloak logout endpoint
   * once that integration is available.  Currently clears the dev placeholder.
   */
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── DEV PLACEHOLDER ─────────────────────────────────────────────────────────
//
//  ⚠️  THIS SECTION IS A TEMPORARY DEVELOPMENT PLACEHOLDER ONLY.
//  ⚠️  It is NOT the production authentication mechanism.
//  ⚠️  The shared ERP/Keycloak team will supply the real session.
//  ⚠️  Replace the `loadSessionFromDevPlaceholder` function below when the
//      Keycloak integration is ready.
//
//  For local UI development, the login page writes a session object to
//  localStorage under the key "prms_dev_session".  The AuthProvider reads
//  that object here so the rest of the frontend can exercise role-based UI.
//
//  Shape stored by the dev login page:
//  {
//    user: { id, username, firstName, lastName, email, displayName },
//    role: "PROCUREMENT_ADMIN" | "REQUESTER" | "SUPPLIER"
//  }
//
// ─────────────────────────────────────────────────────────────────────────────

interface DevSession {
  user: AuthenticatedUser;
  role: PRMSRole;
}

function loadSessionFromDevPlaceholder(): DevSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("prms_dev_session");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DevSession>;
    if (!parsed?.user || !parsed?.role) return null;
    // Validate role is a known PRMS role
    if (!Object.values(ROLES).includes(parsed.role as PRMSRole)) return null;
    return parsed as DevSession;
  } catch {
    return null;
  }
}

function clearDevSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("prms_dev_session");
    // Also clear legacy keys written by the old login page
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  FUTURE INTEGRATION POINT
//  When the shared auth team provides their Keycloak hook/endpoint, replace
//  `loadSessionFromDevPlaceholder()` with their session resolver, e.g.:
//
//    import { getKeycloakSession } from "@erp-shared/auth";
//    const kcSession = await getKeycloakSession();
//    if (kcSession) {
//      setUser(kcSession.user);
//      setRole(kcSession.prmsRole);
//      setIsAuthenticated(true);
//    }
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [role, setRole] = useState<PRMSRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount (dev placeholder; replace with Keycloak call later)
  useEffect(() => {
    const session = loadSessionFromDevPlaceholder();
    if (session) {
      setUser(session.user);
      setRole(session.role);
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    // TODO: delegate to shared ERP/Keycloak logout endpoint when available
    clearDevSession();
    setUser(null);
    setRole(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  const hasRoleFn = useCallback(
    (requiredRole: PRMSRole): boolean => role === requiredRole,
    [role]
  );

  const hasAnyRoleFn = useCallback(
    (allowedRoles: PRMSRole[]): boolean => allowedRoles.some((r) => r === role),
    [role]
  );

  const value: AuthContextValue = {
    user,
    role,
    isLoading,
    isAuthenticated: !isLoading && !!user && !!role,
    hasRole: hasRoleFn,
    hasAnyRole: hasAnyRoleFn,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the PRMS auth context anywhere inside the AuthProvider tree.
 *
 * @example
 *   const { user, role, hasRole, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be used within an <AuthProvider>.");
  }
  return ctx;
}
