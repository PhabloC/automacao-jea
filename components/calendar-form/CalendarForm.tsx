"use client";

import { useState, useEffect, useRef } from "react";
import { loadClientsFromWebhook, type Client } from "@/lib/clients";
import { SpinnerIcon, TrashIcon } from "@/svg";
import { MONTHS } from "@/lib/constants";
import { CalendarFormProps, Post } from "./types";
import PostModal from "./PostModal";

export default function CalendarForm({
  onExecute,
  isExecuting,
}: CalendarFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<{
    client?: string;
    month?: string;
    posts?: string;
  }>({});

  const STORAGE_KEY = "calendar-form-data";
  const isInitialLoad = useRef(true);

  // Carregar dados salvos do localStorage ao montar o componente
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          
          // Carregar posts
          if (parsed.posts && Array.isArray(parsed.posts) && parsed.posts.length > 0) {
            // Validar estrutura dos posts
            const validPosts = parsed.posts.filter(
              (p: any) => p && typeof p === "object" && p.id && p.titulo && p.formato
            );
            if (validPosts.length > 0) {
              setPosts(validPosts);
            }
          }
          
          // Carregar cliente selecionado
          if (parsed.selectedClient && typeof parsed.selectedClient === "string") {
            setSelectedClient(parsed.selectedClient);
          }
          
          // Carregar mês selecionado
          if (parsed.selectedMonth && typeof parsed.selectedMonth === "string") {
            setSelectedMonth(parsed.selectedMonth);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do localStorage:", error);
    } finally {
      // Aguardar um pouco antes de permitir salvamento para evitar conflitos
      setTimeout(() => {
        isInitialLoad.current = false;
      }, 100);
    }
  }, []);

  // Salvar dados no localStorage sempre que mudarem (exceto no carregamento inicial)
  useEffect(() => {
    if (isInitialLoad.current) {
      return; // Não salvar durante o carregamento inicial
    }
    
    try {
      if (typeof window !== "undefined") {
        const dataToSave = {
          posts,
          selectedClient,
          selectedMonth,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }
    } catch (error) {
      console.error("Erro ao salvar dados no localStorage:", error);
    }
  }, [posts, selectedClient, selectedMonth]);

  // Carregar clientes ao montar o componente
  useEffect(() => {
    const loadClients = async () => {
      const webhookClients = await loadClientsFromWebhook("sharepoint");
      setClients(webhookClients);
    };
    loadClients();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const newErrors: { client?: string; month?: string; posts?: string } = {};
    if (!selectedClient) {
      newErrors.client = "Por favor, selecione um cliente";
    }
    if (!selectedMonth) {
      newErrors.month = "Por favor, selecione um mês";
    }
    if (posts.length === 0) {
      newErrors.posts = "Por favor, adicione pelo menos um post";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onExecute(
      selectedClient,
      selectedMonth,
      selectedClientName,
      selectedMonthName,
      posts
    );
    
    // Limpar dados do localStorage após execução bem-sucedida
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPosts([]);
      setSelectedClient("");
      setSelectedMonth("");
    } catch (error) {
      console.error("Erro ao limpar localStorage:", error);
    }
  };

  const handleSavePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    setErrors((prev) => ({ ...prev, posts: undefined }));
    
    // Salvar imediatamente no localStorage quando posts forem salvos
    try {
      if (typeof window !== "undefined") {
        const dataToSave = {
          posts: newPosts,
          selectedClient,
          selectedMonth,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }
    } catch (error) {
      console.error("Erro ao salvar posts no localStorage:", error);
    }
  };

  const handleRemovePost = (postId: string) => {
    const updatedPosts = posts.filter((p) => p.id !== postId);
    setPosts(updatedPosts);
    
    // Salvar imediatamente no localStorage quando post for removido
    try {
      if (typeof window !== "undefined") {
        const dataToSave = {
          posts: updatedPosts,
          selectedClient,
          selectedMonth,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }
    } catch (error) {
      console.error("Erro ao salvar posts no localStorage:", error);
    }
  };

  const selectedClientName =
    clients.find((c) => c.id === selectedClient)?.name || "";
  const selectedMonthName =
    MONTHS.find((m) => m.id === selectedMonth)?.name || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-6">
        {/* Cliente Selection */}
        <div className="mb-6">
          <label
            htmlFor="client"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Selecione o Cliente
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isExecuting}
              className={`
                w-full px-4 py-3 rounded-lg border bg-gray-800 text-white text-left
                focus:ring-2 focus:ring-red-900 focus:border-red-900 transition-colors
                disabled:bg-gray-900 disabled:cursor-not-allowed flex items-center justify-between
                ${errors.client ? "border-red-600" : "border-red-900/50"}
              `}
            >
              <span>
                {selectedClient
                  ? clients.find((c) => c.id === selectedClient)?.name ||
                    "Selecione um cliente"
                  : "Selecione um cliente"}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-red-900/50 rounded-lg shadow-lg max-h-60 overflow-auto">
                {clients.length === 0 ? (
                  <div className="px-4 py-3 text-gray-400 text-sm">
                    Nenhum cliente cadastrado. Adicione clientes na página de Clientes.
                  </div>
                ) : (
                  clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-b-0"
                      onClick={() => {
                        setSelectedClient(client.id);
                        setIsDropdownOpen(false);
                        setErrors((prev) => ({ ...prev, client: undefined }));
                      }}
                    >
                      <span className="text-white flex-1">{client.name}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {errors.client && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.client}
            </p>
          )}
        </div>

        {/* Month Selection */}
        <div className="mb-6">
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Selecione o Mês
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setErrors((prev) => ({ ...prev, month: undefined }));
            }}
            disabled={isExecuting}
            className={`
              w-full px-4 py-3 rounded-lg border bg-gray-800 text-white
              focus:ring-2 focus:ring-red-900 focus:border-red-900 transition-colors
              disabled:bg-gray-900 disabled:cursor-not-allowed
              ${errors.month ? "border-red-600" : "border-red-900/50"}
            `}
          >
            <option value="">Selecione um mês</option>
            {MONTHS.map((month) => (
              <option key={month.id} value={month.id}>
                {month.name}
              </option>
            ))}
          </select>
          {errors.month && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.month}
            </p>
          )}
        </div>

        {/* Posts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Posts ({posts.length})
            </label>
            <button
              type="button"
              onClick={() => setIsPostModalOpen(true)}
              disabled={isExecuting}
              className="cursor-pointer px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Adicionar Posts
            </button>
          </div>

          {/* Lista de Posts */}
          {posts.length > 0 ? (
            <div className="space-y-3">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between p-4 bg-gray-800/50 rounded-lg border border-red-900/20"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-red-400">
                        Post {index + 1}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-red-900/30 text-red-300 rounded">
                        {post.formato}
                      </span>
                    </div>
                    <p className="text-white font-medium">{post.titulo}</p>
                    {post.descricao && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {post.descricao}
                      </p>
                    )}
                    {post.referencia && (
                      <p className="text-gray-500 text-xs mt-1 truncate">
                        Ref: {post.referencia}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePost(post.id)}
                    className="cursor-pointer p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors ml-2"
                    title="Remover post"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-dashed border-red-900/30">
              <p className="text-gray-400 text-sm">
                Nenhum post adicionado ainda.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Clique em "Adicionar Posts" para começar.
              </p>
            </div>
          )}
          {errors.posts && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.posts}
            </p>
          )}
        </div>

        {/* Preview */}
        {selectedClient && selectedMonth && posts.length > 0 && (
          <div className="mb-6 p-4 bg-red-950/30 rounded-lg border border-red-900/50">
            <p className="text-sm font-medium text-red-300 mb-1">
              Resumo da execução:
            </p>
            <p className="text-sm text-red-200">
              Criar {posts.length} tarefa{posts.length > 1 ? "s" : ""} no
              calendário para o cliente <strong>{selectedClientName}</strong> no
              mês de <strong>{selectedMonthName}</strong>
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isExecuting ||
            !selectedClient ||
            !selectedMonth ||
            posts.length === 0
          }
          className={`
            w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 transform
            flex items-center justify-center gap-2
            ${
              isExecuting ||
              !selectedClient ||
              !selectedMonth ||
              posts.length === 0
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-black to-red-950 text-white hover:from-gray-900 hover:to-red-900 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            }
          `}
        >
          {isExecuting ? (
            <>
              <SpinnerIcon className="h-5 w-5" />
              Criando Tarefas...
            </>
          ) : (
            "Criar Tarefas"
          )}
        </button>
      </div>

      {/* Post Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleSavePosts}
        initialPosts={posts}
      />
    </form>
  );
}
