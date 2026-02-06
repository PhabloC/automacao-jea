"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/sidebar/Sidebar";
import {
  BarChartIcon,
  CheckIcon,
  CloseIcon,
  EditIcon,
  SpinnerIcon,
  TrashIcon,
} from "@/svg";
import {
  fetchRelatoriosClientes,
  createRelatorioCliente,
  updateRelatorioCliente,
  deleteRelatorioCliente,
  MESSAGE_TEMPLATES,
  META_TAGS,
  GOOGLE_TAGS,
  type RelatorioCliente,
  type RelatorioClienteCreate,
} from "@/lib/relatorios-clientes";
import { fetchClientsFromWebhook, type Client } from "@/lib/clients";
import AlertModal from "@/components/alert-modal/AlertModal";

const DIAS_SEMANA = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];
const PERIODO_OPCOES = [1, 7, 15, 30];

export default function RelatoriosPage() {
  const { user, loading: authLoading, hasPermission, session } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<RelatorioCliente[]>([]);
  const [filteredClients, setFilteredClients] = useState<RelatorioCliente[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const RELATORIOS_PER_PAGE = 6;
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Clientes n8n (para dropdown no modal adicionar)
  const [n8nClients, setN8nClients] = useState<Client[]>([]);
  const [isLoadingN8nClients, setIsLoadingN8nClients] = useState(false);
  const [selectedN8nClientId, setSelectedN8nClientId] = useState<string>("");

  // Modal cliente (add/edit)
  const [clientModal, setClientModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    client: RelatorioCliente | null;
  }>({ open: false, mode: "add", client: null });
  const [formData, setFormData] = useState<RelatorioClienteCreate>({
    nome: "",
    email: "",
    telefone: "",
    conta_anuncio_meta: null,
    conta_anuncio_google: null,
    dias_envio: [],
    quantidade_dias_relatorio: 7,
    campanha_meta: false,
    saldo_meta: false,
    campanha_google: false,
  });
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Dropdown ações (portal para evitar overlay capturar clique)
  const [dropdownClientId, setDropdownClientId] = useState<number | null>(null);
  const [dropdownAnchor, setDropdownAnchor] = useState<{
    top: number;
    right: number;
  } | null>(null);

  // Modal confirmar exclusão
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    client: RelatorioCliente | null;
  }>({ open: false, client: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal configuração (mensagens Meta/Google)
  const [configModal, setConfigModal] = useState<{
    open: boolean;
    client: RelatorioCliente | null;
  }>({ open: false, client: null });
  const [configPlatform, setConfigPlatform] = useState<"meta" | "google">(
    "meta",
  );
  const [configMessages, setConfigMessages] = useState({
    meta: "",
    google: "",
  });
  const [originalConfigMessages, setOriginalConfigMessages] = useState({
    meta: "",
    google: "",
  });
  const [configHasUnsaved, setConfigHasUnsaved] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Modal "sair sem salvar" (config)
  const [unsavedModal, setUnsavedModal] = useState(false);

  const accessToken = session?.access_token ?? null;

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    else if (!authLoading && !hasPermission) router.push("/dashboard");
  }, [user, authLoading, hasPermission, router]);

  const loadClients = useCallback(async () => {
    if (!user || !hasPermission) return;
    setIsLoading(true);
    try {
      const list = await fetchRelatoriosClientes(accessToken);
      setClients(list);
      setFilteredClients(list);
    } catch (err) {
      console.error(err);
      setToast({
        show: true,
        message:
          err instanceof Error ? err.message : "Erro ao carregar clientes",
        type: "error",
      });
      setClients([]);
      setFilteredClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, hasPermission, accessToken]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredClients(
      clients.filter(
        (c) =>
          c.nome.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term),
      ),
    );
  }, [searchTerm, clients]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filteredClients.length]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / RELATORIOS_PER_PAGE),
  );
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * RELATORIOS_PER_PAGE,
    currentPage * RELATORIOS_PER_PAGE,
  );

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  const loadN8nClients = useCallback(async () => {
    setIsLoadingN8nClients(true);
    try {
      const list = await fetchClientsFromWebhook();
      setN8nClients(list);
    } catch (err) {
      console.error(err);
      setN8nClients([]);
    } finally {
      setIsLoadingN8nClients(false);
    }
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      conta_anuncio_meta: null,
      conta_anuncio_google: null,
      dias_envio: [],
      quantidade_dias_relatorio: 7,
      campanha_meta: false,
      saldo_meta: false,
      campanha_google: false,
    });
    setFormError("");
    setSelectedN8nClientId("");
    setClientModal({ open: true, mode: "add", client: null });
    loadN8nClients();
  };

  const handleSelectN8nClient = (clientId: string) => {
    setSelectedN8nClientId(clientId);
    if (!clientId) {
      setFormData((p) => ({ ...p, nome: "", email: "", telefone: "" }));
      return;
    }
    const client = n8nClients.find((c) => c.id === clientId);
    if (client) {
      setFormData((p) => ({
        ...p,
        nome: client.name,
        email: client.email ?? "",
        telefone: client.telefone ?? "",
      }));
    }
  };

  const handleOpenEdit = (client: RelatorioCliente) => {
    setDropdownClientId(null);
    setDropdownAnchor(null);
    setFormData({
      nome: client.nome,
      email: client.email,
      telefone: client.telefone,
      conta_anuncio_meta: client.conta_anuncio_meta,
      conta_anuncio_google: client.conta_anuncio_google,
      dias_envio: [...(client.dias_envio || [])],
      quantidade_dias_relatorio: client.quantidade_dias_relatorio,
      campanha_meta: client.campanha_meta,
      saldo_meta: client.saldo_meta,
      campanha_google: client.campanha_google,
    });
    setFormError("");
    setClientModal({ open: true, mode: "edit", client });
  };

  const handleCloseClientModal = () => {
    if (!isSaving) {
      setSelectedN8nClientId("");
      setClientModal({ open: false, mode: "add", client: null });
    }
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => {
      const next = prev.dias_envio.includes(day)
        ? prev.dias_envio.filter((d) => d !== day)
        : [...prev.dias_envio, day];
      return { ...prev, dias_envio: next };
    });
  };

  const handleSubmitClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (formData.dias_envio.length === 0) {
      setFormError("Selecione pelo menos um dia de envio");
      return;
    }
    setIsSaving(true);
    try {
      if (clientModal.mode === "add") {
        await createRelatorioCliente(formData, accessToken);
        showToast("Cliente criado com sucesso", "success");
      } else if (clientModal.client) {
        await updateRelatorioCliente(
          clientModal.client.id,
          formData,
          accessToken,
        );
        showToast("Cliente atualizado com sucesso", "success");
      }
      handleCloseClientModal();
      await loadClients();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro ao salvar. Tente novamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleField = async (
    client: RelatorioCliente,
    field: "campanha_meta" | "saldo_meta" | "campanha_google",
    value: boolean,
  ) => {
    try {
      await updateRelatorioCliente(client.id, { [field]: value }, accessToken);
      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, [field]: value } : c)),
      );
      setFilteredClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, [field]: value } : c)),
      );
      showToast(
        `${field.replace("_", " ")} ${
          value ? "ativado" : "desativado"
        } com sucesso`,
        "success",
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao atualizar",
        "error",
      );
    }
  };

  const handleOpenDelete = (client: RelatorioCliente) => {
    setDropdownClientId(null);
    setDropdownAnchor(null);
    setDeleteModal({ open: true, client });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.client) return;
    setIsDeleting(true);
    try {
      await deleteRelatorioCliente(deleteModal.client.id, accessToken);
      showToast("Cliente excluído com sucesso", "success");
      setDeleteModal({ open: false, client: null });
      await loadClients();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao excluir",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenConfig = (client: RelatorioCliente) => {
    setDropdownClientId(null);
    setDropdownAnchor(null);
    setConfigMessages({
      meta: client.mensagem_meta || "",
      google: client.mensagem_google || "",
    });
    setOriginalConfigMessages({
      meta: client.mensagem_meta || "",
      google: client.mensagem_google || "",
    });
    setConfigHasUnsaved(false);
    setConfigPlatform("meta");
    setConfigModal({ open: true, client });
  };

  const handleCloseConfig = () => {
    if (configHasUnsaved) {
      setUnsavedModal(true);
      return;
    }
    setConfigModal({ open: false, client: null });
  };

  const handleConfigMessageChange = (
    platform: "meta" | "google",
    value: string,
  ) => {
    setConfigMessages((prev) => ({ ...prev, [platform]: value }));
    setConfigHasUnsaved(true);
  };

  const handleInsertTag = (platform: "meta" | "google", tag: string) => {
    const key = platform === "meta" ? "meta" : "google";
    setConfigMessages((prev) => ({
      ...prev,
      [key]: prev[key] + tag,
    }));
    setConfigHasUnsaved(true);
  };

  const handleCopyTemplate = (platform: "meta" | "google") => {
    const template = MESSAGE_TEMPLATES[platform];
    const key = platform === "meta" ? "meta" : "google";
    setConfigMessages((prev) => ({ ...prev, [key]: template }));
    setConfigHasUnsaved(true);
    showToast("Template copiado", "success");
  };

  const handleSaveConfig = async () => {
    if (!configModal.client) return;
    setIsSavingConfig(true);
    try {
      await updateRelatorioCliente(
        configModal.client.id,
        {
          mensagem_meta: configMessages.meta || null,
          mensagem_google: configMessages.google || null,
        },
        accessToken,
      );
      setOriginalConfigMessages({ ...configMessages });
      setConfigHasUnsaved(false);
      showToast("Mensagens salvas com sucesso", "success");
      setConfigModal({ open: false, client: null });
      await loadClients();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Erro ao salvar mensagens",
        "error",
      );
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleDiscardConfig = () => {
    setUnsavedModal(false);
    setConfigModal({ open: false, client: null });
    setConfigHasUnsaved(false);
  };

  const formatDiasEnvio = (dias: number[]) => {
    if (!dias.length) return "-";
    return dias
      .sort((a, b) => a - b)
      .map((d) => DIAS_SEMANA.find((x) => x.value === d)?.label ?? d)
      .join(", ");
  };

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
  if (!user || !hasPermission) return null;

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
                  <BarChartIcon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Relatórios
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Gerencie clientes e configurações de relatórios Meta e
                    Google: dias de envio, período e mensagens personalizadas
                    com tags.
                  </p>
                </div>
              </div>
            </div>

            {/* Search + Add */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquise cliente pelo nome ou e-mail"
                className="w-full max-w-md px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900"
              />
              <button
                type="button"
                onClick={handleOpenAdd}
                className="cursor-pointer px-6 py-3 rounded-lg font-medium bg-red-900 hover:bg-red-800 text-white transition-colors flex items-center gap-2 shrink-0"
              >
                <span className="text-lg leading-none">+</span>
                Adicionar relatório
              </button>
            </div>

            {/* Table */}
            <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-red-900/20">
                  <thead className="bg-gray-800/80">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        E-mail
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Relatórios Meta
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Saldo Meta
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Relatórios Google
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Frequência
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Período
                      </th>
                      <th className="px-4 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-900/20">
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-12 text-center text-gray-400"
                        >
                          <SpinnerIcon className="w-8 h-8 text-red-500 animate-spin mx-auto mb-2" />
                          Carregando clientes...
                        </td>
                      </tr>
                    ) : filteredClients.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-12 text-center text-gray-400"
                        >
                          Nenhum cliente encontrado
                        </td>
                      </tr>
                    ) : (
                      paginatedClients.map((client) => (
                        <tr
                          key={client.id}
                          className="bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-white whitespace-nowrap">
                            {client.nome}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                            {client.email}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                            {client.telefone}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleField(
                                  client,
                                  "campanha_meta",
                                  !client.campanha_meta,
                                )
                              }
                              disabled={!client.conta_anuncio_meta}
                              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Relatórios Meta"
                            >
                              <ToggleSwitch
                                checked={client.campanha_meta}
                                disabled={!client.conta_anuncio_meta}
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleField(
                                  client,
                                  "saldo_meta",
                                  !client.saldo_meta,
                                )
                              }
                              disabled={!client.conta_anuncio_meta}
                              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Saldo Meta"
                            >
                              <ToggleSwitch
                                checked={client.saldo_meta}
                                disabled={!client.conta_anuncio_meta}
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleField(
                                  client,
                                  "campanha_google",
                                  !client.campanha_google,
                                )
                              }
                              disabled={!client.conta_anuncio_google}
                              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Relatórios Google"
                            >
                              <ToggleSwitch
                                checked={client.campanha_google}
                                disabled={!client.conta_anuncio_google}
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                            {formatDiasEnvio(client.dias_envio || [])}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                            {client.quantidade_dias_relatorio} dia
                            {client.quantidade_dias_relatorio > 1 ? "s" : ""}
                          </td>
                          <td className="px-4 py-3 text-right relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                const isClosing =
                                  dropdownClientId === client.id;
                                if (isClosing) {
                                  setDropdownAnchor(null);
                                  setDropdownClientId(null);
                                } else {
                                  setDropdownAnchor({
                                    top: rect.bottom + 4,
                                    right: window.innerWidth - rect.right,
                                  });
                                  setDropdownClientId(client.id);
                                }
                              }}
                              className="cursor-pointer p-2 text-gray-400 hover:text-white hover:bg-red-900/30 rounded-lg"
                              aria-label="Ações"
                            >
                              <span className="text-lg leading-none">⋮</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && filteredClients.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-red-900/20 bg-gray-800/50">
                  <p className="text-sm text-gray-400">
                    Mostrando{" "}
                    {(currentPage - 1) * RELATORIOS_PER_PAGE + 1} a{" "}
                    {Math.min(
                      currentPage * RELATORIOS_PER_PAGE,
                      filteredClients.length,
                    )}{" "}
                    de {filteredClients.length} relatórios
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                      aria-label="Página anterior"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-400 px-2">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage >= totalPages}
                      className="cursor-pointer px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                      aria-label="Próxima página"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Dropdown de ações em portal (evita overlay capturar clique em Configuração) */}
      {typeof document !== "undefined" &&
        dropdownClientId !== null &&
        dropdownAnchor !== null &&
        (() => {
          const client = filteredClients.find((c) => c.id === dropdownClientId);
          if (!client) return null;
          return createPortal(
            <>
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => {
                  setDropdownAnchor(null);
                  setDropdownClientId(null);
                }}
                aria-hidden="true"
              />
              <div
                className="fixed z-[9999] bg-gray-900 border border-red-900/30 rounded-lg shadow-lg py-1 min-w-[160px]"
                style={{
                  top: dropdownAnchor.top,
                  right: dropdownAnchor.right,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleOpenEdit(client)}
                  className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-red-950/50 hover:text-white"
                >
                  <EditIcon className="w-4 h-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenConfig(client)}
                  className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-red-950/50 hover:text-white"
                >
                  <span className="w-4 h-4">⚙</span>
                  Configuração
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDelete(client)}
                  className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/50"
                >
                  <TrashIcon className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </>,
            document.body,
          );
        })()}

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === "success"
              ? "bg-green-900/90 border border-green-700"
              : "bg-red-950/90 border border-red-800"
          } text-white text-sm font-medium animate-in slide-in-from-right-5`}
        >
          {toast.message}
        </div>
      )}

      {/* Modal Add/Edit Cliente */}
      {clientModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) =>
            e.target === e.currentTarget && handleCloseClientModal()
          }
        >
          <div
            className="bg-gray-900 border border-red-900/30 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                {clientModal.mode === "add"
                  ? "Adicionar Cliente"
                  : "Editar Cliente"}
              </h2>
              <button
                type="button"
                onClick={handleCloseClientModal}
                disabled={isSaving}
                className="cursor-pointer p-2 text-gray-400 hover:text-white rounded-lg"
                aria-label="Fechar"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitClient} className="p-6 space-y-4">
              {clientModal.mode === "add" ? (
                <>
                  <div>
                    <label
                      htmlFor="rel-cliente-n8n"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Cliente *
                    </label>
                    <select
                      id="rel-cliente-n8n"
                      required
                      value={selectedN8nClientId}
                      onChange={(e) => handleSelectN8nClient(e.target.value)}
                      disabled={isLoadingN8nClients}
                      className="w-full px-3 py-2 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 disabled:opacity-50"
                      aria-label="Selecionar cliente"
                    >
                      <option value="">
                        {isLoadingN8nClients
                          ? "Carregando clientes..."
                          : "Selecione um cliente"}
                      </option>
                      {n8nClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedN8nClientId && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-800/50 rounded-lg border border-red-900/20">
                      <div>
                        <span className="block text-xs font-medium text-gray-500 uppercase mb-0.5">
                          E-mail
                        </span>
                        <p className="text-sm text-gray-300">
                          {formData.email || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-gray-500 uppercase mb-0.5">
                          Telefone
                        </span>
                        <p className="text-sm text-gray-300">
                          {formData.telefone || "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-800/50 rounded-lg border border-red-900/20">
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase mb-0.5">
                        Nome
                      </span>
                      <p className="text-sm text-gray-300">
                        {formData.nome || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase mb-0.5">
                        E-mail
                      </span>
                      <p className="text-sm text-gray-300">
                        {formData.email || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-gray-500 uppercase mb-0.5">
                        Telefone
                      </span>
                      <p className="text-sm text-gray-300">
                        {formData.telefone || "—"}
                      </p>
                    </div>
                  </div>
                </>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="rel-conta-meta"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Conta Anúncio Meta
                  </label>
                  <input
                    id="rel-conta-meta"
                    type="text"
                    value={formData.conta_anuncio_meta ?? ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        conta_anuncio_meta: e.target.value.trim() || null,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="rel-conta-google"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Conta Anúncio Google
                  </label>
                  <input
                    id="rel-conta-google"
                    type="text"
                    value={formData.conta_anuncio_google ?? ""}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        conta_anuncio_google: e.target.value.trim() || null,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900"
                  />
                </div>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-300 mb-2">
                  Frequência * (dias da semana)
                </span>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        formData.dias_envio.includes(d.value)
                          ? "bg-red-900 border-red-700 text-white"
                          : "bg-gray-800 border-red-900/50 text-gray-400 hover:border-red-700"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="rel-periodo"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Período do Relatório *
                </label>
                <select
                  id="rel-periodo"
                  required
                  value={formData.quantidade_dias_relatorio}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      quantidade_dias_relatorio: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900"
                >
                  {PERIODO_OPCOES.map((n) => (
                    <option key={n} value={n}>
                      {n} dia{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="border-t border-gray-800 pt-4 space-y-2">
                <span className="block text-sm font-medium text-gray-300">
                  Relatórios (ativar se tiver conta)
                </span>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">
                      Campanhas Meta
                    </span>
                    <FormToggleWithIcons
                      checked={formData.campanha_meta}
                      onToggle={() =>
                        setFormData((p) => ({
                          ...p,
                          campanha_meta: !p.campanha_meta,
                        }))
                      }
                      disabled={!formData.conta_anuncio_meta}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">Saldo Meta</span>
                    <FormToggleWithIcons
                      checked={formData.saldo_meta}
                      onToggle={() =>
                        setFormData((p) => ({
                          ...p,
                          saldo_meta: !p.saldo_meta,
                        }))
                      }
                      disabled={!formData.conta_anuncio_meta}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">
                      Campanhas Google
                    </span>
                    <FormToggleWithIcons
                      checked={formData.campanha_google}
                      onToggle={() =>
                        setFormData((p) => ({
                          ...p,
                          campanha_google: !p.campanha_google,
                        }))
                      }
                      disabled={!formData.conta_anuncio_google}
                    />
                  </div>
                </div>
              </div>
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseClientModal}
                  disabled={isSaving}
                  className="cursor-pointer px-4 py-2 text-gray-400 hover:text-white rounded-lg disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="cursor-pointer px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                  {clientModal.mode === "add"
                    ? "Salvar Cliente"
                    : "Atualizar Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {deleteModal.open && deleteModal.client && (
        <AlertModal
          isOpen
          onClose={() =>
            !isDeleting && setDeleteModal({ open: false, client: null })
          }
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o cliente "${deleteModal.client.nome}"? Esta ação não pode ser desfeita.`}
          type="warning"
          confirmText={isDeleting ? "Excluindo..." : "Excluir"}
          cancelText="Cancelar"
          showCancel
        />
      )}

      {/* Modal Configuração (Mensagens Meta/Google) */}
      {configModal.open && configModal.client && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && handleCloseConfig()}
        >
          <div
            className="bg-gray-900 border border-red-900/30 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                Configuração de Mensagens
              </h2>
              <button
                type="button"
                onClick={handleCloseConfig}
                disabled={isSavingConfig}
                className="cursor-pointer p-2 text-gray-400 hover:text-white rounded-lg"
                aria-label="Fechar"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-1 bg-gray-800 p-1 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => setConfigPlatform("meta")}
                  className={`cursor-pointer flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    configPlatform === "meta"
                      ? "bg-red-900 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Meta (Facebook/Instagram)
                </button>
                <button
                  type="button"
                  onClick={() => setConfigPlatform("google")}
                  className={`cursor-pointer flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    configPlatform === "google"
                      ? "bg-red-900 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Google Ads
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Tags Disponíveis -{" "}
                    {configPlatform === "meta" ? "Meta" : "Google"}
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {(configPlatform === "meta" ? META_TAGS : GOOGLE_TAGS).map(
                      (item) => (
                        <button
                          key={item.tag}
                          type="button"
                          onClick={() =>
                            handleInsertTag(configPlatform, item.tag)
                          }
                          className="cursor-pointer w-full text-left p-2 rounded-lg border border-red-900/30 hover:border-red-700 hover:bg-red-950/30 transition-colors"
                        >
                          <span
                            className={`text-sm font-mono ${
                              configPlatform === "meta"
                                ? "text-blue-400"
                                : "text-green-400"
                            }`}
                          >
                            {item.tag}
                          </span>
                          <span className="text-xs text-gray-500 block">
                            {item.label}
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">
                      Mensagem para{" "}
                      {configPlatform === "meta" ? "Meta" : "Google"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleCopyTemplate(configPlatform)}
                      className="cursor-pointer px-3 py-1.5 text-sm text-red-400 border border-red-900/50 rounded-lg hover:bg-red-950/50"
                    >
                      Copiar Template
                    </button>
                  </div>
                  <textarea
                    value={
                      configPlatform === "meta"
                        ? configMessages.meta
                        : configMessages.google
                    }
                    onChange={(e) =>
                      handleConfigMessageChange(configPlatform, e.target.value)
                    }
                    rows={15}
                    placeholder="Digite sua mensagem aqui... Use as tags para personalizar."
                    className="w-full p-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isSavingConfig}
                  className="cursor-pointer px-6 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingConfig && (
                    <SpinnerIcon className="w-4 h-4 animate-spin" />
                  )}
                  Salvar Mensagens
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sair sem salvar (config) */}
      {unsavedModal && (
        <AlertModal
          isOpen
          onClose={() => setUnsavedModal(false)}
          onConfirm={handleDiscardConfig}
          title="Alterações não salvas"
          message="Você tem alterações não salvas. Deseja sair sem salvar?"
          type="warning"
          confirmText="Sair sem Salvar"
          cancelText="Cancelar"
          showCancel
        />
      )}
    </div>
  );
}

function ToggleSwitch({
  checked,
  disabled,
}: {
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        disabled ? "bg-gray-700" : checked ? "bg-red-600" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </span>
  );
}

function FormToggleWithIcons({
  checked,
  onToggle,
  disabled,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-900 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        disabled
          ? "cursor-not-allowed bg-gray-700 opacity-50"
          : checked
            ? "cursor-pointer bg-red-600"
            : "cursor-pointer bg-gray-600"
      }`}
      aria-label={checked ? "Desativar" : "Ativar"}
      aria-pressed={checked}
    >
      <span
        className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      >
        {checked ? (
          <CheckIcon className="w-3.5 h-3.5 text-red-600" />
        ) : (
          <CloseIcon className="w-3.5 h-3.5 text-gray-500" />
        )}
      </span>
    </button>
  );
}
