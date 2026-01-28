"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  loadClientsFromWebhook,
  createClientInWebhook,
  deleteClientInWebhook,
  type Client,
} from "@/lib/clients";
import Sidebar from "@/components/sidebar/Sidebar";
import { SpinnerIcon, TrashIcon, UsersIcon } from "@/svg";
import AlertModal, {
  type AlertModalType,
} from "@/components/alert-modal/AlertModal";

export default function ClientesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newClientName, setNewClientName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string>("");

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

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Carregar clientes ao montar o componente
  useEffect(() => {
    if (user) {
      loadClients();
    }
  }, [user]);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const webhookClients = await loadClientsFromWebhook();
      setClients(webhookClients);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar clientes baseado na busca
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!newClientName.trim()) {
      setError("Por favor, insira um nome para o cliente");
      return;
    }

    // Verificar se já existe
    const exists = clients.some(
      (c) => c.name.toLowerCase().trim() === newClientName.toLowerCase().trim()
    );
    if (exists) {
      setError("Este cliente já existe");
      return;
    }

    // Mostrar modal de confirmação
    const trimmedName = newClientName.trim();
    setModalState({
      isOpen: true,
      type: "confirm",
      title: "Confirmar Criação de Cliente",
      message: `Deseja criar o cliente "${trimmedName}"?`,
      onConfirm: async () => {
        await executeCreateClient(trimmedName);
      },
    });
  };

  const executeCreateClient = async (clientName: string) => {
    setIsAdding(true);
    setError("");

    try {
      await createClientInWebhook(clientName);
      
      // Recarregar lista de clientes
      const updatedClients = await loadClientsFromWebhook();
      setClients(updatedClients);
      setNewClientName("");

      // Mostrar modal de sucesso
      setModalState({
        isOpen: true,
        type: "success",
        title: "Cliente Criado",
        message: `O cliente "${clientName}" foi criado com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      setModalState({
        isOpen: true,
        type: "error",
        title: "Erro ao Criar Cliente",
        message: "Erro ao adicionar cliente. Tente novamente.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveClient = async (clientId: string) => {
    const clientToDelete = clients.find((c) => c.id === clientId);
    const clientName = clientToDelete?.name || "este cliente";

    setModalState({
      isOpen: true,
      type: "warning",
      title: "Confirmar Exclusão",
      message: `Tem certeza que deseja remover o cliente "${clientName}"?\n\nEsta ação não pode ser desfeita.`,
      onConfirm: async () => {
        await executeDeleteClient(clientId, clientName);
      },
    });
  };

  const executeDeleteClient = async (clientId: string, clientName: string) => {
    try {
      await deleteClientInWebhook(clientId);

      // Recarregar lista de clientes
      const updatedClients = await loadClientsFromWebhook();
      setClients(updatedClients);

      setModalState({
        isOpen: true,
        type: "success",
        title: "Cliente Excluído",
        message: `O cliente "${clientName}" foi excluído com sucesso!`,
      });
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      setModalState({
        isOpen: true,
        type: "error",
        title: "Erro ao Excluir Cliente",
        message: "Erro ao remover cliente. Tente novamente.",
      });
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
    <div className="h-screen bg-black flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-8">
              <div className="flex items-start gap-6">
                <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-black to-red-950 rounded-xl">
                  <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
                  <p className="text-gray-300 text-lg">
                    Gerencie os clientes cadastrados no sistema. Os clientes adicionados aqui estarão disponíveis em todas as automações.
                  </p>
                </div>
              </div>
            </div>

            {/* Adicionar Cliente */}
            <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Adicionar Novo Cliente
              </h2>
              <form onSubmit={handleAddClient} className="flex gap-3">
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => {
                    setNewClientName(e.target.value);
                    setError("");
                  }}
                  placeholder="Nome do cliente"
                  disabled={isAdding}
                  className="flex-1 px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isAdding || !newClientName.trim()}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    isAdding || !newClientName.trim()
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-red-900 hover:bg-red-800 text-white"
                  }`}
                >
                  {isAdding ? (
                    <>
                      <SpinnerIcon className="w-5 h-5" />
                      Adicionando...
                    </>
                  ) : (
                    "Adicionar"
                  )}
                </button>
              </form>
              {error && (
                <p className="mt-2 text-sm text-red-400">{error}</p>
              )}
            </div>

            {/* Lista de Clientes */}
            <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Clientes Cadastrados ({clients.length})
                </h2>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="px-4 py-2 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900 w-64"
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <SpinnerIcon className="w-8 h-8 text-red-500" />
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm
                    ? "Nenhum cliente encontrado com esse termo de busca."
                    : "Nenhum cliente cadastrado ainda."}
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between px-4 py-4 bg-gray-800/50 rounded-lg border border-red-900/20 hover:border-red-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                          <span className="text-red-400 font-semibold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{client.name}</p>
                          <p className="text-gray-500 text-sm">ID: {client.id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveClient(client.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Remover cliente"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal de Alerta */}
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
        </div>
      </main>
    </div>
  );
}
