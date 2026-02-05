"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  loadClientsFromWebhook,
  createClientInWebhook,
  updateClientInWebhook,
  deleteClientInWebhook,
  getClients,
  type Client,
} from "@/lib/clients";
import Sidebar from "@/components/sidebar/Sidebar";
import Tabs from "@/components/tabs/Tabs";
import { CloseIcon, EditIcon, SpinnerIcon, TrashIcon, UsersIcon } from "@/svg";
import AlertModal, {
  type AlertModalType,
} from "@/components/alert-modal/AlertModal";

export default function ClientesPage() {
  const { user, loading: authLoading, hasPermission } = useAuth();
  const router = useRouter();

  // Inicializa com dados em cache (localStorage) para exibir imediatamente no F5
  const [clients, setClients] = useState<Client[]>(() => getClients());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string>("");

  // Modal de criar cliente (com abas Cliente + Contato)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");

  // Estados da edição
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editError, setEditError] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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

  // Redirecionar para login ou dashboard se não tiver permissão (mesmo padrão do calendário)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && !hasPermission) {
      router.push("/dashboard");
    }
  }, [user, authLoading, hasPermission, router]);

  // Carregar clientes ao montar o componente (apenas com usuário autorizado)
  useEffect(() => {
    if (user && hasPermission) {
      loadClients();
    }
  }, [user, hasPermission]);

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
      resetCreateModalForm();
      setIsCreateModalOpen(false);

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

  const resetCreateModalForm = () => {
    setNewClientName("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setError("");
  };

  const handleCloseCreateModal = () => {
    if (!isAdding) {
      resetCreateModalForm();
      setIsCreateModalOpen(false);
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

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setEditName(client.name);
    setEditError("");
  };

  const handleCloseEdit = () => {
    if (!isSavingEdit) {
      setEditingClient(null);
      setEditName("");
      setEditError("");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingClient) return;

    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditError("Por favor, insira um nome para o cliente");
      return;
    }

    const exists = clients.some(
      (c) =>
        c.id !== editingClient.id &&
        c.name.toLowerCase().trim() === trimmedName.toLowerCase()
    );
    if (exists) {
      setEditError("Já existe um cliente com esse nome");
      return;
    }

    setIsSavingEdit(true);
    setEditError("");

    try {
      await updateClientInWebhook(editingClient.id, trimmedName);
      const updatedClients = await loadClientsFromWebhook();
      setClients(updatedClients);
      handleCloseEdit();
      setModalState({
        isOpen: true,
        type: "success",
        title: "Cliente Atualizado",
        message: `O cliente foi atualizado para "${trimmedName}" com sucesso!`,
      });
    } catch (err) {
      console.error("Erro ao editar cliente:", err);
      setEditError("Erro ao editar cliente. Tente novamente.");
    } finally {
      setIsSavingEdit(false);
    }
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
  if (!user || !hasPermission) {
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
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Clientes
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Gerencie os clientes cadastrados no sistema. Os clientes
                    adicionados aqui estarão disponíveis em todas as automações.
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de Clientes */}
            <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-6">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">
                    Clientes Cadastrados ({clients.length})
                  </h2>
                  {isLoading && clients.length > 0 && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-400">
                      <SpinnerIcon className="w-4 h-4 animate-spin" />
                      Atualizando...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cliente..."
                    className="px-4 py-2 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900 w-64"
                    aria-label="Buscar cliente"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="cursor-pointer px-5 py-2.5 rounded-lg font-medium bg-red-900 hover:bg-red-800 text-white transition-colors flex items-center gap-2 shrink-0"
                    aria-label="Novo cliente"
                  >
                    <UsersIcon className="w-5 h-5" />
                    Novo Cliente
                  </button>
                </div>
              </div>

              {isLoading && clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <SpinnerIcon className="w-8 h-8 text-red-500 animate-spin" />
                  <p className="text-gray-400">Carregando clientes...</p>
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
                          <p className="text-white font-medium">
                            {client.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            ID: {client.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(client)}
                          className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Editar cliente"
                          aria-label="Editar cliente"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveClient(client.id)}
                          className="cursor-pointer p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Remover cliente"
                          aria-label="Remover cliente"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal de Edição de Cliente */}
            {editingClient && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={(e) =>
                  e.target === e.currentTarget && handleCloseEdit()
                }
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-client-title"
              >
                <div
                  className="bg-gray-900 border border-red-900/30 rounded-xl shadow-2xl w-full max-w-md mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2
                      id="edit-client-title"
                      className="text-lg font-semibold text-white"
                    >
                      Editar Cliente
                    </h2>
                    <button
                      type="button"
                      onClick={handleCloseEdit}
                      disabled={isSavingEdit}
                      className="cursor-pointer p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Fechar"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-4">
                    <label
                      htmlFor="edit-client-name"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Nome do cliente
                    </label>
                    <input
                      id="edit-client-name"
                      type="text"
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setEditError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit();
                        if (e.key === "Escape") handleCloseEdit();
                      }}
                      disabled={isSavingEdit}
                      className="w-full px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:opacity-50"
                      placeholder="Nome do cliente"
                      autoFocus
                    />
                    {editError && (
                      <p className="text-sm text-red-400">{editError}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800">
                    <button
                      type="button"
                      onClick={handleCloseEdit}
                      disabled={isSavingEdit}
                      className="cursor-pointer px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSavingEdit || !editName.trim()}
                      className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        isSavingEdit || !editName.trim()
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-red-900 hover:bg-red-800 text-white"
                      }`}
                    >
                      {isSavingEdit ? (
                        <>
                          <SpinnerIcon className="w-4 h-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Novo Cliente (com abas Cliente + Contato) */}
            {isCreateModalOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={(e) =>
                  e.target === e.currentTarget && handleCloseCreateModal()
                }
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-client-modal-title"
              >
                <div
                  className="bg-gray-900 border border-red-900/30 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
                    <h2
                      id="create-client-modal-title"
                      className="text-lg font-semibold text-white"
                    >
                      Cadastrar Cliente
                    </h2>
                    <button
                      type="button"
                      onClick={handleCloseCreateModal}
                      disabled={isAdding}
                      className="cursor-pointer p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                      aria-label="Fechar"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className=" p-4 overflow-y-auto flex-1">
                    <Tabs
                      defaultTab="cliente"
                      tabs={[
                        {
                          id: "cliente",
                          label: "Cliente",
                          content: (
                            <div className="space-y-4">
                              <label
                                htmlFor="new-client-name"
                                className="block text-sm font-medium text-gray-300"
                              >
                                Nome do cliente
                              </label>
                              <input
                                id="new-client-name"
                                type="text"
                                value={newClientName}
                                onChange={(e) => {
                                  setNewClientName(e.target.value);
                                  setError("");
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleAddClient();
                                  }
                                }}
                                disabled={isAdding}
                                className="w-full px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:opacity-50"
                                placeholder="Nome do cliente"
                                autoFocus
                                aria-required="true"
                                aria-invalid={!!error}
                                aria-describedby={
                                  error ? "client-name-error" : undefined
                                }
                              />
                              {error && (
                                <p
                                  id="client-name-error"
                                  className="text-sm text-red-400"
                                >
                                  {error}
                                </p>
                              )}
                            </div>
                          ),
                        },
                        {
                          id: "contato",
                          label: "Contato",
                          content: (
                            <div className="space-y-4">
                              <div>
                                <label
                                  htmlFor="contact-name"
                                  className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                  Nome
                                </label>
                                <input
                                  id="contact-name"
                                  type="text"
                                  value={contactName}
                                  onChange={(e) =>
                                    setContactName(e.target.value)
                                  }
                                  disabled={isAdding}
                                  className="w-full px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:opacity-50"
                                  placeholder="Nome do contato"
                                  aria-label="Nome do contato"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="contact-email"
                                  className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                  E-mail
                                </label>
                                <input
                                  id="contact-email"
                                  type="email"
                                  value={contactEmail}
                                  onChange={(e) =>
                                    setContactEmail(e.target.value)
                                  }
                                  disabled={isAdding}
                                  className="w-full px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:opacity-50"
                                  placeholder="email@exemplo.com"
                                  aria-label="E-mail do contato"
                                />
                              </div>
                              <div>
                                <label
                                  htmlFor="contact-phone"
                                  className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                  Telefone
                                </label>
                                <input
                                  id="contact-phone"
                                  type="tel"
                                  value={contactPhone}
                                  onChange={(e) =>
                                    setContactPhone(e.target.value)
                                  }
                                  disabled={isAdding}
                                  className="w-full px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900 disabled:opacity-50"
                                  placeholder="(00) 00000-0000"
                                  aria-label="Telefone do contato"
                                />
                              </div>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800 shrink-0">
                    <button
                      type="button"
                      onClick={handleCloseCreateModal}
                      disabled={isAdding}
                      className="cursor-pointer px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddClient()}
                      disabled={isAdding || !newClientName.trim()}
                      className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        isAdding || !newClientName.trim()
                          ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                          : "bg-red-900 hover:bg-red-800 text-white"
                      }`}
                    >
                      {isAdding ? (
                        <>
                          <SpinnerIcon className="w-4 h-4 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        "Cadastrar"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Alerta */}
            <AlertModal
              isOpen={modalState.isOpen}
              onClose={() =>
                setModalState((prev) => ({ ...prev, isOpen: false }))
              }
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
