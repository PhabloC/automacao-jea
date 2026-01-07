"use client";

import { useState } from "react";
import { CLIENTS, MONTHS } from "@/lib/constants";
import { SpinnerIcon } from "@/svg";

interface SharePointFormProps {
  onExecute: (
    clientId: string,
    monthId: string,
    clientName: string,
    monthName: string
  ) => Promise<void>;
  isExecuting: boolean;
}

export default function SharePointForm({
  onExecute,
  isExecuting,
}: SharePointFormProps) {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [errors, setErrors] = useState<{
    client?: string;
    month?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const newErrors: { client?: string; month?: string } = {};
    if (!selectedClient) {
      newErrors.client = "Por favor, selecione um cliente";
    }
    if (!selectedMonth) {
      newErrors.month = "Por favor, selecione um mês";
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
      selectedMonthName
    );
  };

  const selectedClientName =
    CLIENTS.find((c) => c.id === selectedClient)?.name || "";
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
            Qual cliente gostaria de criar as pastas?
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
            {CLIENTS.map((client) => (
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

        {/* Month Selection */}
        <div className="mb-6">
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Para qual mês irá criar a pasta?
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
              w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
              disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
              ${errors.month ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
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

        {/* Preview */}
        {selectedClient && selectedMonth && (
          <div className="mb-6 p-4 bg-red-950/30 rounded-lg border border-red-900/50">
            <p className="text-sm font-medium text-red-300 mb-1">
              Resumo da execução:
            </p>
            <p className="text-sm text-red-200">
              Criar pasta para o cliente <strong>{selectedClientName}</strong> no
              mês de <strong>{selectedMonthName}</strong>
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isExecuting || !selectedClient || !selectedMonth}
          className={`
            w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 transform
            flex items-center justify-center gap-2
            ${
              isExecuting || !selectedClient || !selectedMonth
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

