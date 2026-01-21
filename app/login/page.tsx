"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginPage from "@/components/login/LoginPage";
import { useAuth } from "@/contexts/AuthContext";
import { SpinnerIcon } from "@/svg";

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirecionar para home se já estiver autenticado
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon className="w-10 h-10 text-red-500 animate-spin" />
          <p className="text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se já estiver logado, não renderizar nada enquanto redireciona
  if (user) {
    return null;
  }

  return <LoginPage />;
}
