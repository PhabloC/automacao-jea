"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header/Header";
import Tabs from "@/components/tabs/Tabs";
import AutomationPage from "@/components/automation-page/AutomationPage";
import {
  createInitialAutomations,
  executeAutomation,
  fetchN8NStatistics,
  type AutomationData,
} from "@/lib/automations";
import {
  SharePointIcon,
  ClickUpIcon,
  LightningIcon,
  BarChartIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
} from "@/svg";

export default function Home() {
  const [automations, setAutomations] =
    useState<AutomationData[]>(createInitialAutomations());
  const [executing, setExecuting] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Carregar estatísticas do n8n ao montar o componente
  useEffect(() => {
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
  }, []);

  // Calcular estatísticas totais
  const totalExecutions = automations.reduce(
    (sum, auto) => sum + auto.executionCount,
    0
  );
  const totalSuccess = automations.reduce(
    (sum, auto) => sum + auto.successCount,
    0
  );
  const successRate =
    totalExecutions > 0
      ? Math.round((totalSuccess / totalExecutions) * 100)
      : 0;
  const activeCount = automations.filter((a) => a.status === "active").length;

  const handleExecute = async (
    automationId: string,
    params?: {
      clientId?: string;
      monthId?: string;
      clientName?: string;
      monthName?: string;
    }
  ) => {
    // Bloquear execução simultânea da mesma automação
    if (executing[automationId]) return;

    setExecuting((prev) => ({ ...prev, [automationId]: true }));

    try {
      const result = await executeAutomation(automationId, params);

      // Buscar estatísticas atualizadas do n8n após a execução
      const stats = await fetchN8NStatistics(automationId);

      // Atualizar dados da automação com estatísticas reais do n8n
      setAutomations((prev) =>
        prev.map((auto) => {
          if (auto.id === automationId) {
            return {
              ...auto,
              executionCount: stats.executionCount,
              successCount: stats.successCount,
              errorCount: stats.errorCount,
              lastRun: stats.lastRun || result.timestamp,
              status: stats.status,
            };
          }
          return auto;
        })
      );

      // Mostrar notificação
      setNotification({
        show: true,
        message: result.message,
        type: result.success ? "success" : "error",
      });

      // Esconder notificação após 5 segundos
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 5000);
    } catch (error) {
      setNotification({
        show: true,
        message: "Erro inesperado ao executar automação",
        type: "error",
      });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 5000);
    } finally {
      setExecuting((prev) => ({ ...prev, [automationId]: false }));
    }
  };

  const getAutomationIcon = (id: string, size: "small" | "large" = "large") => {
    const sizeClass = size === "small" ? "w-4 h-4" : "w-6 h-6";
    const colorClass = size === "small" ? "text-current" : "text-white";

    if (id === "sharepoint") {
      return <SharePointIcon className={`${sizeClass} ${colorClass}`} />;
    }
    return <ClickUpIcon className={`${sizeClass} ${colorClass}`} />;
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bem-vindo ao Painel de Automações
          </h2>
          <p className="text-gray-300">
            Gerencie e execute suas automações integradas com n8n
          </p>
        </div>

        {/* Tabs with Automation Pages */}
        <Tabs
          tabs={automations.map((automation) => ({
            id: automation.id,
            label: automation.title,
            icon: getAutomationIcon(automation.id, "small"),
            content: (
              <AutomationPage
                automation={automation}
                executing={executing[automation.id] || false}
                onExecute={handleExecute}
                icon={getAutomationIcon(automation.id, "large")}
              />
            ),
          }))}
        />

        {/* Notification Toast */}
        {notification.show && (
          <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-900/50 border border-green-800"
                  : "bg-red-950/50 border border-red-900"
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  notification.type === "success"
                    ? "bg-green-600"
                    : "bg-red-700"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckIcon className="w-5 h-5 text-white" />
                ) : (
                  <CloseIcon className="w-5 h-5 text-white" />
                )}
              </div>
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {notification.message}
              </p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-950/50 rounded-lg">
              <InfoIcon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Integração com n8n
              </p>
              <p className="text-sm text-gray-300">
                Este painel está conectado com n8n para gerenciar e executar
                automações de forma centralizada.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
