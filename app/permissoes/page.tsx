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

interface UserPermission {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "admin" | "editor";
  created_at: string;
  updated_at: string;
}

export default function PermissoesPage() {
  const { user, session, loading: authLoading, isAdmin, isLocalhost } = useAuth();
  const router = useRouter();

  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Redirecionar se não for admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    } else if (!authLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [user, authLoading, isAdmin, router]);

  // Carregar permissões
  useEffect(() => {
    if (!user || !isAdmin) return;

    const loadPermissions = async () => {
      setLoading(true);
      try {
        // Em localhost, usar dados simulados
        if (isLocalhost) {
          setPermissions([
            {
              id: "1",
              user_id: "dev-user-localhost",
              email: "dev@localhost.com",
              full_name: "Desenvolvedor Local",
              avatar_url: null,
              role: "admin",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          setLoading(false);
          return;
        }

        const response = await fetch("/api/permissions", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPermissions(data.permissions || []);
        } else {
          showNotification("Erro ao carregar permissões", "error");
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
        showNotification("Erro ao carregar permissões", "error");
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [user, isAdmin, session, isLocalhost]);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "editor") => {
    if (isLocalhost) {
      showNotification("Alteração simulada (modo desenvolvimento)", "success");
      setPermissions((prev) =>
        prev.map((p) => (p.user_id === userId ? { ...p, role: newRole } : p))
      );
      return;
    }

    setSaving(userId);
    try {
      const permission = permissions.find((p) => p.user_id === userId);
      if (!permission) return;

      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          email: permission.email,
          full_name: permission.full_name,
          avatar_url: permission.avatar_url,
          role: newRole,
        }),
      });

      if (response.ok) {
        setPermissions((prev) =>
          prev.map((p) => (p.user_id === userId ? { ...p, role: newRole } : p))
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

  const handleRemovePermission = async (userId: string) => {
    if (userId === user?.id) {
      showNotification("Você não pode remover sua própria permissão", "error");
      return;
    }

    if (!confirm("Tem certeza que deseja remover a permissão deste usuário?")) {
      return;
    }

    if (isLocalhost) {
      showNotification("Remoção simulada (modo desenvolvimento)", "success");
      setPermissions((prev) => prev.filter((p) => p.user_id !== userId));
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
        setPermissions((prev) => prev.filter((p) => p.user_id !== userId));
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

  const getRoleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-900/50 text-red-400 border border-red-800">
          Administrador
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900/50 text-blue-400 border border-blue-800">
        Editor
      </span>
    );
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

          {/* Users List */}
          <div className="bg-gray-900/50 border border-red-900/30 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-red-900/30">
              <h3 className="text-lg font-medium text-white">
                Usuários com Permissão
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {permissions.length} usuário(s) com acesso ao sistema
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <SpinnerIcon className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            ) : permissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <UserIcon className="w-12 h-12 mb-4" />
                <p>Nenhum usuário com permissão encontrado</p>
              </div>
            ) : (
              <div className="divide-y divide-red-900/30">
                {permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="p-6 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      {permission.avatar_url ? (
                        <Image
                          src={permission.avatar_url}
                          alt={permission.full_name || permission.email}
                          width={48}
                          height={48}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      )}

                      {/* User Info */}
                      <div>
                        <p className="font-medium text-white">
                          {permission.full_name || "Sem nome"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {permission.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Role Badge */}
                      {getRoleBadge(permission.role)}

                      {/* Role Selector */}
                      <select
                        value={permission.role}
                        onChange={(e) =>
                          handleRoleChange(
                            permission.user_id,
                            e.target.value as "admin" | "editor"
                          )
                        }
                        disabled={
                          saving === permission.user_id ||
                          permission.user_id === user?.id
                        }
                        className="px-3 py-2 bg-gray-800 border border-red-900/30 rounded-lg text-white text-sm focus:outline-none focus:border-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="admin">Administrador</option>
                        <option value="editor">Editor</option>
                      </select>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleRemovePermission(permission.user_id)}
                        disabled={
                          saving === permission.user_id ||
                          permission.user_id === user?.id
                        }
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-950/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          permission.user_id === user?.id
                            ? "Você não pode remover sua própria permissão"
                            : "Remover permissão"
                        }
                      >
                        {saving === permission.user_id ? (
                          <SpinnerIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          <TrashIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note */}
          <div className="mt-6 p-4 bg-yellow-950/30 border border-yellow-900/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              <strong>Nota:</strong> Novos usuários que fizerem login com Google
              precisam ter suas permissões adicionadas manualmente por um
              administrador no Supabase ou através desta interface.
            </p>
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
