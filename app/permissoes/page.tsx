"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar/Sidebar";


import {
  UserIcon,
  SpinnerIcon,
  CheckIcon,
  CloseIcon,
  TrashIcon,
  ShieldIcon,
} from "@/svg";
import ConfirmModal from "@/components/ui/confirm-modal/ConfirmModal";

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  provider: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: "admin" | "editor" | null;
  has_permission: boolean;
}

interface ModalState {
  isOpen: boolean;
  type: "delete" | "grant_editor" | "grant_admin" | null;
  user: UserData | null;
}

export default function PermissoesPage() {
  const { user, session, loading: authLoading, isAdmin, isLocalhost } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"with_permission" | "without_permission">("with_permission");
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });
  
  // Estado do modal
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: null,
    user: null,
  });

  // Redirecionar se não for admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, authLoading, isAdmin, router]);

  // Carregar usuários
  const loadUsers = async () => {
    setLoading(true);
    try {
      // Em localhost, usar dados simulados
      if (isLocalhost) {
        setUsers([
          {
            id: "dev-user-localhost",
            email: "dev@localhost.com",
            full_name: "Desenvolvedor Local",
            avatar_url: null,
            provider: "google",
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            role: "admin",
            has_permission: true,
          },
          {
            id: "user-sem-permissao",
            email: "novo@usuario.com",
            full_name: "Novo Usuário",
            avatar_url: null,
            provider: "google",
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            role: null,
            has_permission: false,
          },
        ]);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        showNotification("Erro ao carregar usuários", "error");
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      showNotification("Erro ao carregar usuários", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadUsers();
  }, [user, isAdmin, session, isLocalhost]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  // Abrir modal de confirmação
  const openModal = (type: "delete" | "grant_editor" | "grant_admin", targetUser: UserData) => {
    setModal({ isOpen: true, type, user: targetUser });
  };

  // Fechar modal
  const closeModal = () => {
    setModal({ isOpen: false, type: null, user: null });
  };

  // Dar permissão a um usuário
  const handleGrantPermission = async (targetUser: UserData, role: "admin" | "editor") => {
    if (isLocalhost) {
      showNotification("Permissão concedida (modo desenvolvimento)", "success");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, role, has_permission: true } : u
        )
      );
      closeModal();
      return;
    }

    setSaving(targetUser.id);
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: targetUser.id,
          email: targetUser.email,
          full_name: targetUser.full_name,
          avatar_url: targetUser.avatar_url,
          role,
        }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id ? { ...u, role, has_permission: true } : u
          )
        );
        showNotification("Permissão concedida com sucesso!", "success");
      } else {
        const data = await response.json();
        showNotification(data.error || "Erro ao conceder permissão", "error");
      }
    } catch (error) {
      console.error("Erro ao conceder permissão:", error);
      showNotification("Erro ao conceder permissão", "error");
    } finally {
      setSaving(null);
      closeModal();
    }
  };

  // Alterar role de um usuário
  const handleRoleChange = async (userId: string, newRole: "admin" | "editor") => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    if (isLocalhost) {
      showNotification("Permissão alterada (modo desenvolvimento)", "success");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      return;
    }

    setSaving(userId);
    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          email: targetUser.email,
          full_name: targetUser.full_name,
          avatar_url: targetUser.avatar_url,
          role: newRole,
        }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        showNotification("Permissão atualizada com sucesso!", "success");
      } else {
        const data = await response.json();
        showNotification(data.error || "Erro ao atualizar permissão", "error");
      }
    } catch (error) {
      console.error("Erro ao atualizar permissão:", error);
      showNotification("Erro ao atualizar permissão", "error");
    } finally {
      setSaving(null);
    }
  };

  // Remover permissão de um usuário
  const handleRemovePermission = async (userId: string) => {
    if (userId === user?.id) {
      showNotification("Você não pode remover sua própria permissão", "error");
      return;
    }

    if (isLocalhost) {
      showNotification("Permissão removida (modo desenvolvimento)", "success");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: null, has_permission: false } : u
        )
      );
      return;
    }

    setSaving(userId);
    try {
      const response = await fetch(`/api/permissions?user_id=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: null, has_permission: false } : u
          )
        );
        showNotification("Permissão removida com sucesso!", "success");
      } else {
        const data = await response.json();
        showNotification(data.error || "Erro ao remover permissão", "error");
      }
    } catch (error) {
      console.error("Erro ao remover permissão:", error);
      showNotification("Erro ao remover permissão", "error");
    } finally {
      setSaving(null);
    }
  };

  // Excluir usuário completamente
  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      showNotification("Você não pode excluir sua própria conta", "error");
      closeModal();
      return;
    }

    if (isLocalhost) {
      showNotification("Usuário excluído (modo desenvolvimento)", "success");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      closeModal();
      return;
    }

    setSaving(userId);
    try {
      const response = await fetch(`/api/users?user_id=${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showNotification("Usuário excluído com sucesso!", "success");
      } else {
        const data = await response.json();
        showNotification(data.error || "Erro ao excluir usuário", "error");
      }
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      showNotification("Erro ao excluir usuário", "error");
    } finally {
      setSaving(null);
      closeModal();
    }
  };

  // Handler de confirmação do modal
  const handleModalConfirm = () => {
    if (!modal.user) return;

    switch (modal.type) {
      case "delete":
        handleDeleteUser(modal.user.id);
        break;
      case "grant_editor":
        handleGrantPermission(modal.user, "editor");
        break;
      case "grant_admin":
        handleGrantPermission(modal.user, "admin");
        break;
    }
  };

  // Configuração do modal baseado no tipo
  const getModalConfig = () => {
    if (!modal.user) return { title: "", message: "", confirmText: "", type: "info" as const };

    const userName = modal.user.full_name || modal.user.email;

    switch (modal.type) {
      case "delete":
        return {
          title: "Excluir Usuário",
          message: `Tem certeza que deseja EXCLUIR o usuário "${userName}"? Esta ação é irreversível e removerá a conta completamente do sistema.`,
          confirmText: "Excluir Usuário",
          type: "danger" as const,
        };
      case "grant_editor":
        return {
          title: "Conceder Acesso de Editor",
          message: `Você está prestes a conceder acesso de EDITOR para "${userName}". O usuário poderá executar automações do sistema.`,
          confirmText: "Conceder Acesso",
          type: "info" as const,
        };
      case "grant_admin":
        return {
          title: "Conceder Acesso de Administrador",
          message: `Você está prestes a conceder acesso de ADMINISTRADOR para "${userName}". O usuário terá acesso total ao sistema, incluindo gerenciamento de permissões.`,
          confirmText: "Conceder Acesso Admin",
          type: "warning" as const,
        };
      default:
        return { title: "", message: "", confirmText: "", type: "info" as const };
    }
  };

  const modalConfig = getModalConfig();

  const getRoleBadge = (role: string | null) => {
    if (role === "admin") {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-900/50 text-red-400 border border-red-800">
          Administrador
        </span>
      );
    }
    if (role === "editor") {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/50 text-blue-400 border border-blue-800">
          Editor
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-900/50 text-yellow-400 border border-yellow-800">
        Sem permissão
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filtrar usuários por aba
  const usersWithPermission = users.filter((u) => u.has_permission);
  const usersWithoutPermission = users.filter((u) => !u.has_permission);

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <ShieldIcon className="w-8 h-8 text-red-500" />
              <h1 className="text-3xl font-bold text-white">
                Controle de Permissões
              </h1>
            </div>
            <p className="text-gray-400">
              Gerencie as permissões dos usuários do sistema
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-medium text-white mb-4">
              Tipos de Permissão
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-red-950/30 border border-red-900/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                  <ShieldIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-red-400">Administrador</p>
                  <p className="text-sm text-gray-400">
                    Acesso total ao sistema, pode gerenciar permissões de outros
                    usuários
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-950/30 border border-blue-900/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-400">Editor</p>
                  <p className="text-sm text-gray-400">
                    Pode executar automações, mas não gerencia permissões
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("with_permission")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === "with_permission"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Com Permissão ({usersWithPermission.length})
            </button>
            <button
              onClick={() => setActiveTab("without_permission")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTab === "without_permission"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              Pendentes ({usersWithoutPermission.length})
              {usersWithoutPermission.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-600 text-white rounded-full">
                  Novo
                </span>
              )}
            </button>
          </div>

          {/* Users List */}
          <div className="bg-gray-900/50 border border-red-900/30 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-red-900/30">
              <h3 className="text-lg font-medium text-white">
                {activeTab === "with_permission"
                  ? "Usuários com Permissão"
                  : "Usuários Aguardando Permissão"}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === "with_permission"
                  ? `${usersWithPermission.length} usuário(s) com acesso ao sistema`
                  : `${usersWithoutPermission.length} usuário(s) aguardando liberação`}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <SpinnerIcon className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : activeTab === "with_permission" ? (
              usersWithPermission.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <UserIcon className="w-12 h-12 mb-4" />
                  <p>Nenhum usuário com permissão encontrado</p>
                </div>
              ) : (
                <div className="divide-y divide-red-900/30">
                  {usersWithPermission.map((u) => (
                    <div
                      key={u.id}
                      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        {u.avatar_url ? (
                          <Image
                            src={u.avatar_url}
                            alt={u.full_name || u.email}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">
                            {u.full_name || "Sem nome"}
                          </p>
                          <p className="text-sm text-gray-400">{u.email}</p>
                          <p className="text-xs text-gray-500">
                            Último acesso: {formatDate(u.last_sign_in_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getRoleBadge(u.role)}

                        <select
                          value={u.role || "editor"}
                          onChange={(e) =>
                            handleRoleChange(
                              u.id,
                              e.target.value as "admin" | "editor"
                            )
                          }
                          disabled={saving === u.id || u.id === user?.id}
                          className="px-3 py-2 bg-gray-800 border border-red-900/30 rounded-lg text-white text-sm focus:outline-none focus:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <option value="admin">Administrador</option>
                          <option value="editor">Editor</option>
                        </select>

                        <button
                          onClick={() => handleRemovePermission(u.id)}
                          disabled={saving === u.id || u.id === user?.id}
                          className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-950/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title="Remover permissão"
                        >
                          {saving === u.id ? (
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                          ) : (
                            <CloseIcon className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          onClick={() => openModal("delete", u)}
                          disabled={saving === u.id || u.id === user?.id}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-950/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title="Excluir usuário"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : usersWithoutPermission.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CheckIcon className="w-12 h-12 mb-4 text-green-500" />
                <p>Nenhum usuário aguardando permissão</p>
              </div>
            ) : (
              <div className="divide-y divide-red-900/30">
                {usersWithoutPermission.map((u) => (
                  <div
                    key={u.id}
                    className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {u.avatar_url ? (
                        <Image
                          src={u.avatar_url}
                          alt={u.full_name || u.email}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-yellow-600 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-white">
                          {u.full_name || "Sem nome"}
                        </p>
                        <p className="text-sm text-gray-400">{u.email}</p>
                        <p className="text-xs text-gray-500">
                          Cadastrado em: {formatDate(u.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getRoleBadge(u.role)}

                      <button
                        onClick={() => openModal("grant_editor", u)}
                        disabled={saving === u.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                      >
                        {saving === u.id ? (
                          <SpinnerIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          "Dar acesso Editor"
                        )}
                      </button>

                      <button
                        onClick={() => openModal("grant_admin", u)}
                        disabled={saving === u.id}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed cursor-pointer"
                      >
                        {saving === u.id ? (
                          <SpinnerIcon className="w-4 h-4 animate-spin" />
                        ) : (
                          "Dar acesso Admin"
                        )}
                      </button>

                      <button
                        onClick={() => openModal("delete", u)}
                        disabled={saving === u.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-950/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Excluir usuário"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={handleModalConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText="Cancelar"
        type={modalConfig.type}
        loading={saving === modal.user?.id}
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
