"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar/Sidebar";
import { SharePointIcon, ClickUpIcon, SpinnerIcon } from "@/svg";
import { automationDefinitions } from "@/lib/automations";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const getAutomationIcon = (id: string) => {
    if (id === "sharepoint") {
      return <SharePointIcon className="w-6 h-6" />;
    }
    return <ClickUpIcon className="w-6 h-6" />;
  };

  // Mostrar loading enquanto verifica autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon className="w-10 h-10 text-red-500 animate-spin" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não renderizar nada enquanto redireciona
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">
              Selecione uma automação para executar
            </p>
          </div>

          {/* Automations List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automationDefinitions.map((automation) => (
              <Link
                key={automation.id}
                href={`/automacao/${automation.id}`}
                className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6 hover:border-red-600/50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 bg-red-600 rounded-lg group-hover:bg-red-500 transition-colors">
                    <div className="text-white">
                      {getAutomationIcon(automation.id)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                      {automation.title}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {automation.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
