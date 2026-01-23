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
} from "@/svg";

export default function PerfilPage() {
  const { user, loading: authLoading, isLocalhost } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Em localhost, apenas simula o salvamento
      if (isLocalhost) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setNotification({
          show: true,
          message: "Perfil atualizado com sucesso! (modo desenvolvimento)",
          type: "success",
        });
      } else {
        // Em produção, atualiza via Supabase
        const { supabase } = await import("@/lib/supabase");
        const { error } = await supabase.auth.updateUser({
          data: {
            full_name: formData.name,
          },
        });

        if (error) throw error;

        setNotification({
          show: true,
          message: "Perfil atualizado com sucesso!",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setNotification({
        show: true,
        message: "Erro ao atualizar perfil. Tente novamente.",
        type: "error",
      });
    } finally {
      setSaving(false);
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 5000);
    }
  };

  // Dados do usuário para exibição
  const userAvatar = user?.user_metadata?.avatar_url || "";
  const userProvider = user?.app_metadata?.provider || "email";

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
            <p className="text-gray-400">
              Gerencie suas informações pessoais
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-gray-900/50 border border-red-900/30 rounded-xl p-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-red-900/30">
              <div className="relative mb-4">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt={formData.name || "Avatar"}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-red-600 flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400">
                {userProvider === "google" 
                  ? "Foto sincronizada com Google" 
                  : "Avatar padrão"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Nome completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-red-900/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800/50 border border-red-900/30 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O email não pode ser alterado
                </p>
              </div>

              {/* Provedor de autenticação */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Método de login
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 border border-red-900/30 rounded-lg">
                  {userProvider === "google" ? (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span className="text-gray-300">Google</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-300">Email e senha</span>
                    </>
                  )}
                </div>
              </div>

              {/* Informações da conta */}
              <div className="pt-6 border-t border-red-900/30">
                <h3 className="text-lg font-medium text-white mb-4">
                  Informações da conta
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="px-4 py-3 bg-gray-800/50 border border-red-900/30 rounded-lg">
                    <p className="text-xs text-gray-500">ID do usuário</p>
                    <p className="text-sm text-gray-300 truncate">{user.id}</p>
                  </div>
                  <div className="px-4 py-3 bg-gray-800/50 border border-red-900/30 rounded-lg">
                    <p className="text-xs text-gray-500">Conta criada em</p>
                    <p className="text-sm text-gray-300">
                      {new Date(user.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de salvar */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {saving ? (
                    <>
                      <SpinnerIcon className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-5 h-5" />
                      Salvar alterações
                    </>
                  )}
                </button>
              </div>
            </form>
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
