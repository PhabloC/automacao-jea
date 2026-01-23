"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Preloader from "@/components/preloader/Preloader";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [showPreloader, setShowPreloader] = useState(true);

  // Callback quando o preloader termina
  const handlePreloaderComplete = useCallback(() => {
    setShowPreloader(false);
  }, []);

  // Verificar autenticação quando o preloader terminar
  useEffect(() => {
    if (!showPreloader && !authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    }
  }, [showPreloader, user, authLoading, router]);

  // Mostrar preloader enquanto carrega
  if (showPreloader) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  // Mostrar tela preta durante a transição
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
