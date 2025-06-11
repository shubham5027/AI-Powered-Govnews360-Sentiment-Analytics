import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: null;
  session: null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Bypass authentication by setting everything as authenticated
  const isAuthenticated = true;
  const isAdmin = true;

  const logout = async () => {
    // No-op since we're bypassing auth
    console.log('Auth is bypassed');
  };

  return (
    <AuthContext.Provider value={{ 
      user: null, 
      session: null, 
      isAuthenticated, 
      isAdmin, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Modified to always allow access
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Modified to always allow access
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

