"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar/Sidebar";
import {
  SharePointIcon,
  ClickUpIcon,
  LightningIcon,
  BarChartIcon,
  CheckCircleIcon,
  SpinnerIcon,
} from "@/svg";
import {
  createInitialAutomations,
  fetchN8NStatistics,
  type AutomationData,
} from "@/lib/automations";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [automations, setAutomations] =
    useState<AutomationData[]>(createInitialAutomations());
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Carregar estatísticas do n8n ao montar o componente
  useEffect(() => {
    if (!user) return;

    const loadStatistics = async () => {
      const initialAutomations = createInitialAutomations();
      for (const automation of initialAutomations) {
        setLoading((prev) => ({ ...prev, [automation.id]: true }));
        try {
          const stats = await fetchN8NStatistics(automation.id);
          setAutomations((prev) =>
            prev.map((auto) => {
              if (auto.id === automation.id) {
                return {
                  ...auto,
                  executionCount: stats.executionCount,
                  successCount: stats.successCount,
                  errorCount: stats.errorCount,
                  lastRun: stats.lastRun,
                  status: stats.status,
                };
              }
              return auto;
            })
          );
        } catch (error) {
          console.error(
            `Erro ao carregar estatísticas para ${automation.id}:`,
            error
          );
        } finally {
          setLoading((prev) => ({ ...prev, [automation.id]: false }));
        }
      }
    };

    loadStatistics();
  }, [user]);

  // Calcular estatísticas totais
  const totalExecutions = automations.reduce(
    (sum, auto) => sum + auto.executionCount,
    0
  );
  const totalSuccess = automations.reduce(
    (sum, auto) => sum + auto.successCount,
    0
  );
  const totalErrors = automations.reduce(
    (sum, auto) => sum + auto.errorCount,
    0
  );
  const successRate =
    totalExecutions > 0
      ? Math.round((totalSuccess / totalExecutions) * 100)
      : 0;
  const activeCount = automations.filter((a) => a.status === "active").length;

  const getAutomationIcon = (id: string) => {
    if (id === "sharepoint") {
      return <SharePointIcon className="w-6 h-6" />;
    }
    return <ClickUpIcon className="w-6 h-6" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-900/50 text-green-400 border border-green-800">
            Ativo
          </span>
        );
      case "inactive":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-900/50 text-gray-400 border border-gray-700">
            Inativo
          </span>
        );
      case "error":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-900/50 text-red-400 border border-red-800">
            Erro
          </span>
        );
      default:
        return null;
    }
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
              Visão geral de todas as suas automações
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-950/50 rounded-lg">
                  <LightningIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total de Execuções</p>
                  <p className="text-2xl font-bold text-white">
                    {totalExecutions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-950/50 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Sucessos</p>
                  <p className="text-2xl font-bold text-white">{totalSuccess}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-red-950/50 rounded-lg">
                  <BarChartIcon className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-white">{successRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-950/50 rounded-lg">
                  <LightningIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Automações Ativas</p>
                  <p className="text-2xl font-bold text-white">
                    {activeCount}/{automations.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Automations List */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Todas as Automações
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {automations.map((automation) => (
                <Link
                  key={automation.id}
                  href={`/automacao/${automation.id}`}
                  className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6 hover:border-red-600/50 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg group-hover:bg-red-500 transition-colors">
                        <div className="text-white">
                          {getAutomationIcon(automation.id)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                          {automation.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {automation.description}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(automation.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-red-900/30">
                    <div>
                      <p className="text-xs text-gray-500">Execuções</p>
                      <p className="text-lg font-semibold text-white">
                        {loading[automation.id] ? (
                          <SpinnerIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          automation.executionCount
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sucessos</p>
                      <p className="text-lg font-semibold text-green-400">
                        {loading[automation.id] ? (
                          <SpinnerIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          automation.successCount
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Erros</p>
                      <p className="text-lg font-semibold text-red-400">
                        {loading[automation.id] ? (
                          <SpinnerIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          automation.errorCount
                        )}
                      </p>
                    </div>
                  </div>

                  {automation.lastRun && (
                    <p className="text-xs text-gray-500 mt-4">
                      Última execução: {automation.lastRun}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
