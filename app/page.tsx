"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SpinnerIcon } from "@/svg";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirecionar para login ou dashboard
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, authLoading, router]);

  // Mostrar loading enquanto verifica autenticação
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <SpinnerIcon className="w-10 h-10 text-red-500 animate-spin" />
        <p className="text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}
