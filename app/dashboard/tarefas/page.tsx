"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar/Sidebar";
import {
  SpinnerIcon,
  CheckCircleIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/svg";
import type { TaskPost } from "@/lib/tasks";
import {
  getTasks,
  deleteTask,
  fetchTasksFromApi,
  deleteTaskFromApi,
  type Task,
} from "@/lib/tasks";
import Image from "next/image";
import AlertModal, {
  type AlertModalType,
} from "@/components/alert-modal/AlertModal";

export default function TarefasPage() {
  const {
    user,
    loading: authLoading,
    isAdmin,
    session,
    isLocalhost,
  } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const tasksPerPage = 4;

  // Estados do modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: AlertModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "confirm",
    title: "",
    message: "",
  });

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
  }, [user, isAdmin, session?.access_token, isLocalhost]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      if (isLocalhost) {
        setTasks(getTasks());
      } else if (session?.access_token) {
        const allTasks = await fetchTasksFromApi(session.access_token);
        setTasks(allTasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const handleDeleteTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalState({
      isOpen: true,
      type: "warning",
      title: "Confirmar Exclusão",
      message: `Tem certeza que deseja excluir esta tarefa?\n\nAutomação: ${task.automationName}\nCliente: ${task.clientName}\n\nEsta ação não pode ser desfeita.`,
      onConfirm: async () => {
        if (isLocalhost) {
          deleteTask(task.id);
          await loadTasks();
        } else if (session?.access_token) {
          const ok = await deleteTaskFromApi(session.access_token, task.id);
          if (ok) await loadTasks();
        }
        setModalState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Calcular tarefas da página atual
  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const currentTasks = tasks.slice(startIndex, endIndex);

  // Ajustar página se necessário quando as tarefas mudarem
  useEffect(() => {
    if (tasks.length > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [tasks.length, totalPages, currentPage]);

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
                <>
                  <div className="space-y-3">
                    {currentTasks.map((task) => {
                      const isExpanded = expandedTaskId === task.id;
                      const hasPosts =
                        task.posts &&
                        Array.isArray(task.posts) &&
                        task.posts.length > 0;

                      return (
                        <div
                          key={task.id}
                          className={`rounded-lg border transition-colors overflow-hidden ${
                            task.success
                              ? "bg-gray-800/50 border-green-900/30"
                              : "bg-gray-800/50 border-red-900/30"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            className="w-full p-4 text-left cursor-pointer hover:bg-gray-800/70 transition-colors flex items-start gap-4"
                            aria-expanded={isExpanded}
                            aria-label={
                              isExpanded
                                ? `Recolher detalhes da tarefa de ${task.userName}`
                                : `Expandir detalhes da tarefa de ${task.userName}`
                            }
                          >
                            {/* Ícone de expandir/recolher */}
                            <div className="shrink-0 pt-1">
                              <ChevronRightIcon
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </div>

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
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${
                                      task.success
                                        ? "bg-green-900/30 text-green-300"
                                        : "bg-red-900/30 text-red-300"
                                    }`}
                                  >
                                    {task.success ? "Sucesso" : "Erro"}
                                  </div>
                                  <button
                                    onClick={(e) => handleDeleteTask(task, e)}
                                    className="cursor-pointer p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                                    title="Excluir tarefa"
                                    aria-label="Excluir tarefa"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
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
                          </button>

                          {/* Área expandida com posts */}
                          {isExpanded && (
                            <div className="border-t border-gray-700/50 bg-gray-900/50 px-4 py-4">
                              {hasPosts ? (
                                <div className="space-y-4">
                                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                                    Posts da tarefa
                                  </h3>
                                  <div className="space-y-3">
                                    {task.posts!.map(
                                      (post: TaskPost, index: number) => (
                                        <div
                                          key={post.id}
                                          className="p-4 rounded-lg bg-gray-800/70 border border-gray-700/50"
                                        >
                                          <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-medium text-red-400">
                                              Post {index + 1}
                                            </span>
                                            {post.formato && (
                                              <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-300 rounded">
                                                {post.formato}
                                              </span>
                                            )}
                                            {post.canais && (
                                              <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 rounded">
                                                {post.canais}
                                              </span>
                                            )}
                                          </div>
                                          <div className="grid gap-2 text-sm">
                                            {post.titulo && (
                                              <div>
                                                <span className="font-medium text-gray-400">
                                                  Título:
                                                </span>
                                                <span className="text-white ml-2">
                                                  {post.titulo}
                                                </span>
                                              </div>
                                            )}
                                            {post.dataPublicacao && (
                                              <div>
                                                <span className="font-medium text-gray-400">
                                                  Data de Publicação:
                                                </span>
                                                <span className="text-white ml-2">
                                                  {new Date(
                                                    post.dataPublicacao,
                                                  ).toLocaleDateString(
                                                    "pt-BR",
                                                    {
                                                      day: "2-digit",
                                                      month: "2-digit",
                                                      year: "numeric",
                                                    },
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                            {post.descricao && (
                                              <div>
                                                <span className="font-medium text-gray-400">
                                                  Descrição:
                                                </span>
                                                <p className="text-white mt-1 whitespace-pre-wrap">
                                                  {post.descricao}
                                                </p>
                                              </div>
                                            )}
                                            {post.referencia && (
                                              <div>
                                                <span className="font-medium text-gray-400">
                                                  Referência:
                                                </span>
                                                <span className="text-white ml-2 break-all">
                                                  {post.referencia}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">
                                  Posts não disponíveis para esta tarefa.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700/50">
                      <div className="text-sm text-gray-400">
                        Mostrando {startIndex + 1} -{" "}
                        {Math.min(endIndex, tasks.length)} de {tasks.length}{" "}
                        tarefas
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                          className={`cursor-pointer px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            currentPage === 1
                              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                              : "bg-gray-800 text-white hover:bg-gray-700"
                          }`}
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                          Anterior
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => {
                            // Mostrar apenas algumas páginas ao redor da atual
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`cursor-pointer px-3 py-2 rounded-lg transition-colors ${
                                    currentPage === page
                                      ? "bg-red-600 text-white"
                                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span key={page} className="px-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1),
                            )
                          }
                          disabled={currentPage === totalPages}
                          className={`cursor-pointer px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            currentPage === totalPages
                              ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                              : "bg-gray-800 text-white hover:bg-gray-700"
                          }`}
                        >
                          Próxima
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Confirmação */}
      <AlertModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={
          modalState.type === "confirm" || modalState.type === "warning"
            ? "Confirmar"
            : "OK"
        }
        cancelText="Cancelar"
        showCancel={
          modalState.type === "confirm" || modalState.type === "warning"
        }
      />
    </div>
  );
}
