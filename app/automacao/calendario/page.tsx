"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar/Sidebar";
import CalendarForm from "@/components/calendar-form/CalendarForm";
import { Post } from "@/components/calendar-form/types";
import { CalendarIcon, SpinnerIcon, CheckIcon, CloseIcon } from "@/svg";
import {
  createInitialAutomations,
  executeAutomation,
  fetchN8NStatistics,
  type AutomationData,
} from "@/lib/automations";
import { saveTask } from "@/lib/tasks";

export default function CalendarioAutomationPage() {
  const { user, loading: authLoading, hasPermission } = useAuth();
  const router = useRouter();
  const [automation, setAutomation] = useState<AutomationData | null>(null);
  const [executing, setExecuting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Redirecionar para login ou dashboard se não tiver permissão
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && !hasPermission) {
      router.push("/dashboard");
    }
  }, [user, authLoading, hasPermission, router]);

  // Carregar dados da automação
  useEffect(() => {
    if (!user) return;

    const loadAutomation = async () => {
      const initialAutomations = createInitialAutomations();
      const calendarioAutomation = initialAutomations.find(
        (a) => a.id === "calendario",
      );
      if (calendarioAutomation) {
        setAutomation(calendarioAutomation);
        try {
          const stats = await fetchN8NStatistics("calendario");
          setAutomation((prev) =>
            prev
              ? {
                  ...prev,
                  executionCount: stats.executionCount,
                  successCount: stats.successCount,
                  errorCount: stats.errorCount,
                  lastRun: stats.lastRun,
                  status: stats.status,
                }
              : null,
          );
        } catch (error) {
          console.error("Erro ao carregar estatísticas:", error);
        }
      }
    };

    loadAutomation();
  }, [user]);

  const handleExecute = async (
    clientId: string,
    monthId: string,
    clientName: string,
    monthName: string,
    posts: Post[],
  ) => {
    if (executing) return;

    setExecuting(true);

    try {
      const result = await executeAutomation("calendario", {
        clientId,
        monthId,
        clientName,
        monthName,
        posts,
      });

      // Salvar tarefa criada
      if (user) {
        saveTask({
          automationId: "calendario",
          automationName: "Calendário",
          clientId,
          clientName,
          monthId,
          monthName,
          postsCount: posts.length,
          userId: user.id,
          userName:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Usuário",
          userEmail: user.email || "",
          userAvatar: user.user_metadata?.avatar_url,
          success: result.success,
          message: result.message,
        });
      }

      const stats = await fetchN8NStatistics("calendario");

      setAutomation((prev) =>
        prev
          ? {
              ...prev,
              executionCount: stats.executionCount,
              successCount: stats.successCount,
              errorCount: stats.errorCount,
              lastRun: stats.lastRun || result.timestamp,
              status: stats.status,
            }
          : null,
      );

      setNotification({
        show: true,
        message: result.message,
        type: result.success ? "success" : "error",
      });

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
      setExecuting(false);
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
  if (!user || !hasPermission || !automation) {
    return null;
  }

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Automation Details Card */}
            <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-black to-red-950 rounded-xl">
                  <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {automation.title}
                  </h1>
                  <p className="text-gray-300 text-lg">
                    {automation.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Automation Card for Execution */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Executar Automação
              </h2>
              <CalendarForm onExecute={handleExecute} isExecuting={executing} />
            </div>
          </div>
        </div>
      </main>

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
                notification.type === "success" ? "bg-green-600" : "bg-red-700"
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
    </div>
  );
}
