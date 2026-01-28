"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar/Sidebar";
import { SpinnerIcon, CheckCircleIcon, ShieldIcon } from "@/svg";
import { getTasks, type Task } from "@/lib/tasks";
import Image from "next/image";

export default function TarefasPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirecionar se não for admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, authLoading, isAdmin, router]);

  // Carregar tarefas
  useEffect(() => {
    if (user && isAdmin) {
      loadTasks();
    }
  }, [user, isAdmin]);

  const loadTasks = () => {
    setIsLoading(true);
    try {
      const allTasks = getTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Agora";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Há ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Há ${hours} hora${hours > 1 ? "s" : ""}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      if (days === 1) {
        return "Ontem";
      } else if (days < 7) {
        return `Há ${days} dias`;
      } else {
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
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
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-8">
              <div className="flex items-start gap-6">
                <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-black to-red-950 rounded-xl">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Tarefas
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Visualize todas as tarefas criadas pelas automações do
                    sistema.
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Tarefas */}
            <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Tarefas Criadas ({tasks.length})
                </h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <SpinnerIcon className="w-8 h-8 text-red-500 animate-spin" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-lg">Nenhuma tarefa criada ainda.</p>
                  <p className="text-sm mt-2">
                    As tarefas aparecerão aqui quando as automações forem
                    executadas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        task.success
                          ? "bg-gray-800/50 border-green-900/30"
                          : "bg-gray-800/50 border-red-900/30"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar do Usuário */}
                        <div className="shrink-0">
                          {task.userAvatar ? (
                            <Image
                              src={task.userAvatar}
                              alt={task.userName}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {task.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Informações da Tarefa */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-semibold">
                                  {task.userName}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-400 text-sm">
                                  {formatDate(task.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">
                                {task.message}
                              </p>
                            </div>
                            <div
                              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                                task.success
                                  ? "bg-green-900/30 text-green-300"
                                  : "bg-red-900/30 text-red-300"
                              }`}
                            >
                              {task.success ? "Sucesso" : "Erro"}
                            </div>
                          </div>

                          {/* Detalhes */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-3 pt-3 border-t border-gray-700/50">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-300">
                                Automação:
                              </span>
                              <span>{task.automationName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-300">
                                Cliente:
                              </span>
                              <span>{task.clientName}</span>
                            </div>
                            {task.monthName && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-300">
                                  Mês:
                                </span>
                                <span>{task.monthName}</span>
                              </div>
                            )}
                            {task.postsCount !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-300">
                                  Posts:
                                </span>
                                <span>{task.postsCount}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
