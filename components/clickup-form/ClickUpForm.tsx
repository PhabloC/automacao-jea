"use client";

import { useState, useEffect, useRef } from "react";
import { getClients, addClient, removeClient, clientNameExists, loadClientsFromWebhook, createClientInWebhook, deleteClientInWebhook, type Client } from "@/lib/clients";
import { SpinnerIcon, TrashIcon } from "@/svg";

interface ClickUpFormProps {
  onExecute: (clientId: string, clientName: string) => Promise<void>;
  isExecuting: boolean;
}

export default function ClickUpForm({
  onExecute,
  isExecuting,
}: ClickUpFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [newClientName, setNewClientName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<{
    client?: string;
    newClient?: string;
  }>({});

  // Carregar clientes ao montar o componente
  useEffect(() => {
    const loadClients = async () => {
      // Primeiro carrega do webhook
      const webhookClients = await loadClientsFromWebhook("clickup");
      setClients(webhookClients);
    };
    loadClients();
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    const newErrors: { client?: string } = {};
    if (!selectedClient) {
      newErrors.client = "Por favor, selecione um cliente";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onExecute(selectedClient, selectedClientName);
  };

  const handleAddClient = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!newClientName.trim()) {
      setErrors((prev) => ({ ...prev, newClient: "Por favor, insira um nome para o cliente" }));
      return;
    }

    if (clientNameExists("clickup", newClientName)) {
      setErrors((prev) => ({ ...prev, newClient: "Este cliente já existe" }));
      return;
    }

    try {
      const trimmedName = newClientName.trim();
      
      // Criar cliente no webhook n8n primeiro
      await createClientInWebhook(trimmedName);
      
      // Recarregar clientes do webhook para garantir sincronização
      const updatedClients = await loadClientsFromWebhook("clickup");
      setClients(updatedClients);
      
      // Buscar o cliente recém-criado pelo nome (ignorando maiúsculas/minúsculas)
      const createdClient = updatedClients.find(
        (client) => client.name.toLowerCase().trim() === trimmedName.toLowerCase()
      );

      // Selecionar o cliente criado, ou o último da lista se não encontrar
      if (createdClient) {
        setSelectedClient(createdClient.id);
      } else {
        // Caso não encontre pelo nome, selecionar o último cliente da lista
        const lastClient = updatedClients[updatedClients.length - 1];
        if (lastClient) {
          setSelectedClient(lastClient.id);
        }
      }
      
      setNewClientName("");
      setErrors((prev) => ({ ...prev, newClient: undefined }));
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      setErrors((prev) => ({
        ...prev,
        newClient: "Erro ao adicionar cliente. Tente novamente.",
      }));
    }
  };

  const handleRemoveClient = async (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja remover este cliente?")) {
      try {
        // Deletar cliente no webhook n8n
        await deleteClientInWebhook(clientId);

        // Recarregar clientes do webhook para garantir sincronização
        const updatedClients = await loadClientsFromWebhook("clickup");
        setClients(updatedClients);

        // Se o cliente removido estava selecionado, limpar a seleção
        if (selectedClient === clientId) {
          setSelectedClient("");
        }
      } catch (error) {
        console.error("Erro ao remover cliente:", error);
        alert("Erro ao remover cliente. Tente novamente.");
      }
    }
  };

  const selectedClientName =
    clients.find((c) => c.id === selectedClient)?.name || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-6">
        {/* Adicionar Cliente */}
        <div className="mb-6">
          <label
            htmlFor="new-client"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Adicionar Cliente
          </label>
          <div className="flex gap-2">
            <input
              id="new-client"
              type="text"
              value={newClientName}
              onChange={(e) => {
                setNewClientName(e.target.value);
                setErrors((prev) => ({ ...prev, newClient: undefined }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddClient(e as any);
                }
              }}
              placeholder="Nome do cliente"
              className="flex-1 px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900"
            />
            <button
              type="button"
              onClick={handleAddClient}
              className="px-6 py-3 bg-red-900 hover:bg-red-800 text-white rounded-lg transition-colors font-medium"
            >
              Adicionar
            </button>
          </div>
          {errors.newClient && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.newClient}
            </p>
          )}
        </div>

        {/* Cliente Selection */}
        <div className="mb-6">
          <label
            htmlFor="client"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Qual cliente gostaria de criar?
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
                  ? clients.find((c) => c.id === selectedClient)?.name || "Selecione um cliente"
                  : "Selecione um cliente"}
              </span>
              <svg
                className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
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
                    Nenhum cliente cadastrado
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
                      <button
                        type="button"
                        onClick={(e) => handleRemoveClient(e, client.id)}
                        className="ml-2 p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                        title="Remover cliente"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
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

        {/* Preview */}
        {selectedClient && (
          <div className="mb-6 p-4 bg-red-950/30 rounded-lg border border-red-900/50">
            <p className="text-sm font-medium text-red-300 mb-1">
              Resumo da execução:
            </p>
            <p className="text-sm text-red-200">
              Criar tarefas no ClickUp para o cliente <strong>{selectedClientName}</strong>
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isExecuting || !selectedClient}
          className={`
            w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 transform
            flex items-center justify-center gap-2
            ${
              isExecuting || !selectedClient
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-black to-red-950 text-white hover:from-gray-900 hover:to-red-900 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
            }
          `}
        >
          {isExecuting ? (
            <>
              <SpinnerIcon className="h-5 w-5" />
              Executando...
            </>
          ) : (
            "Executar Automação"
          )}
        </button>
      </div>
    </form>
  );
}

