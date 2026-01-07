"use client";

import { useState } from "react";
import { CLICKUP_CLIENTS } from "@/lib/constants";
import { SpinnerIcon } from "@/svg";

interface ClickUpFormProps {
  onExecute: (clientId: string, clientName: string) => Promise<void>;
  isExecuting: boolean;
}

export default function ClickUpForm({
  onExecute,
  isExecuting,
}: ClickUpFormProps) {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [errors, setErrors] = useState<{
    client?: string;
  }>({});

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

  const selectedClientName =
    CLICKUP_CLIENTS.find((c) => c.id === selectedClient)?.name || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-6">
        {/* Cliente Selection */}
        <div className="mb-6">
          <label
            htmlFor="client"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Qual cliente gostaria de criar?
          </label>
          <select
            id="client"
            value={selectedClient}
            onChange={(e) => {
              setSelectedClient(e.target.value);
              setErrors((prev) => ({ ...prev, client: undefined }));
            }}
            disabled={isExecuting}
            className={`
              w-full px-4 py-3 rounded-lg border bg-gray-800 text-white
              focus:ring-2 focus:ring-red-900 focus:border-red-900 transition-colors
              disabled:bg-gray-900 disabled:cursor-not-allowed
              ${errors.client ? "border-red-600" : "border-red-900/50"}
            `}
          >
            <option value="">Selecione um cliente</option>
            {CLICKUP_CLIENTS.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
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

