"use client";

import React, { createContext, useContext, useState } from "react";
import { UserRole } from "./constants";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneE164: string;
  role: UserRole;
  avatarUrl?: string;
  profileDetails?: {
    diasporaCountry?: string;
    businessName?: string;
    operatingRadiusKm?: number;
    verificationStatus?: "UNVERIFIED" | "PENDING" | "VERIFIED";
    qualifications?: string;
  };
}

// Development role-account defaults (non-fictional)
export const ROLE_TEST_ACCOUNTS: Record<UserRole, UserProfile> = {
  CLIENT: {
    id: "usr-client-active",
    email: "client@kuvakahub.co.zw",
    fullName: "Client Account",
    phoneE164: "+263771000001",
    role: "CLIENT",
    profileDetails: {
      diasporaCountry: "United Kingdom",
    },
  },
  PROVIDER: {
    id: "usr-provider-active",
    email: "provider@kuvakahub.co.zw",
    fullName: "Provider Account",
    phoneE164: "+263771000002",
    role: "PROVIDER",
    profileDetails: {
      businessName: "Registered Construction Services",
      operatingRadiusKm: 40,
      verificationStatus: "VERIFIED",
    },
  },
  INSPECTOR: {
    id: "usr-inspector-active",
    email: "inspector@kuvakahub.co.zw",
    fullName: "Site Inspector",
    phoneE164: "+263771000003",
    role: "INSPECTOR",
    profileDetails: {
      qualifications: "Registered Civil Engineer",
      verificationStatus: "VERIFIED",
    },
  },
  ADMIN: {
    id: "usr-admin-active",
    email: "admin@kuvakahub.co.zw",
    fullName: "Admin Officer",
    phoneE164: "+263771000004",
    role: "ADMIN",
  },
};

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  registerClient: (data: { fullName: string; email: string; phone: string; diasporaCountry: string }) => void;
  registerProvider: (data: { fullName: string; businessName: string; email: string; phone: string; serviceCategory: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(ROLE_TEST_ACCOUNTS.CLIENT);

  // Role Switcher Handler (Development Only)
  const switchRole = (newRole: UserRole) => {
    if (process.env.NODE_ENV !== "development") {
      console.warn("Role Switcher is disabled in production.");
      return;
    }
    // Update role on current authenticated user or set role test account
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        role: newRole,
        fullName: currentUser.fullName.includes("Account") ? ROLE_TEST_ACCOUNTS[newRole].fullName : currentUser.fullName,
      });
    } else {
      setCurrentUser(ROLE_TEST_ACCOUNTS[newRole]);
    }
  };

  const login = (email: string, targetRole: UserRole = "CLIENT") => {
    setCurrentUser({
      id: `usr-${Date.now()}`,
      email,
      fullName: email.split("@")[0] || "Account",
      phoneE164: "+263771000000",
      role: targetRole,
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerClient = (data: { fullName: string; email: string; phone: string; diasporaCountry: string }) => {
    setCurrentUser({
      id: `usr-client-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phoneE164: data.phone,
      role: "CLIENT",
      profileDetails: { diasporaCountry: data.diasporaCountry },
    });
  };

  const registerProvider = (data: { fullName: string; businessName: string; email: string; phone: string; serviceCategory: string }) => {
    setCurrentUser({
      id: `usr-provider-${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
      phoneE164: data.phone,
      role: "PROVIDER",
      profileDetails: {
        businessName: data.businessName,
        verificationStatus: "UNVERIFIED",
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        role: currentUser?.role || "CLIENT",
        isAuthenticated: !!currentUser,
        switchRole,
        login,
        logout,
        registerClient,
        registerProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
