'use client';

import { createContext, useContext } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';

const AuthContext = createContext(undefined);

/**
 * AuthProvider — wraps the app in next-auth's SessionProvider
 * and layers our own context on top for convenience.
 */
export function AuthProvider({ children, session }) {
  return (
    <SessionProvider session={session}>
      <AuthInnerProvider>{children}</AuthInnerProvider>
    </SessionProvider>
  );
}

function AuthInnerProvider({ children }) {
  const { data: session, status } = useSession();

  const value = {
    session,
    user: session?.user ?? null,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
