"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "editor" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole;
  hasPermission: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isLocalhost: boolean;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuário fake para desenvolvimento local
const devUser: User = {
  id: "dev-user-localhost",
  aud: "authenticated",
  role: "authenticated",
  email: "dev@localhost.com",
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    full_name: "Desenvolvedor Local",
    avatar_url: "",
  },
} as User;

// Verifica se está rodando em localhost
const checkIsLocalhost = (): boolean => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1";
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Função para buscar a role do usuário
  const fetchUserRole = async (accessToken: string) => {
    try {
      const response = await fetch("/api/permissions/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);
        setHasPermission(data.hasPermission);
      } else {
        setUserRole(null);
        setHasPermission(false);
      }
    } catch (error) {
      console.error("Erro ao buscar role do usuário:", error);
      setUserRole(null);
      setHasPermission(false);
    }
  };

  // Função para atualizar a role do usuário (pode ser chamada externamente)
  const refreshUserRole = async () => {
    if (session?.access_token) {
      await fetchUserRole(session.access_token);
    }
  };

  useEffect(() => {
    const isLocal = checkIsLocalhost();
    setIsLocalhost(isLocal);

    // Se estiver em localhost, usar usuário de desenvolvimento como admin
    if (isLocal) {
      setUser(devUser);
      setSession(null);
      setUserRole("admin"); // Em localhost, sempre é admin
      setHasPermission(true);
      setLoading(false);
      return;
    }

    // Verificar sessão atual ao carregar (apenas em produção)
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Buscar role do usuário se estiver logado
      if (session?.access_token) {
        await fetchUserRole(session.access_token);
      }
      
      setLoading(false);
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Buscar role do usuário quando a sessão mudar
        if (session?.access_token) {
          await fetchUserRole(session.access_token);
        } else {
          setUserRole(null);
          setHasPermission(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error("Erro ao fazer login com Google:", error.message);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        hasPermission,
        isAdmin: userRole === "admin",
        signInWithGoogle,
        signOut,
        isLocalhost,
        refreshUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
