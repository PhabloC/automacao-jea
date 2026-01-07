"use client";

import AutomationCard from "@/components/automation-card/AutomationCard";
import SharePointForm from "@/components/sharepoint-form/SharePointForm";
import ClickUpForm from "@/components/clickup-form/ClickUpForm";
import { AutomationPageProps } from "./types";

export default function AutomationPage({
  automation,
  executing,
  onExecute,
  icon,
}: AutomationPageProps) {
  return (
    <div className="space-y-6">
      {/* Automation Details Card */}
      <div className="bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 p-8">
        <div className="flex items-start gap-6 mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-black to-red-950 rounded-xl">
            {icon}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {automation.title}
            </h1>
            <p className="text-gray-300 text-lg">
              {automation.description}
            </p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <p className="text-sm font-medium text-gray-400 mb-2">
              Total de Execuções
            </p>
            <p className="text-3xl font-bold text-white">
              {automation.executionCount}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Execuções Bem-sucedidas
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {automation.successCount}
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Execuções com Erro
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {automation.errorCount}
            </p>
          </div>
        </div>

        {/* Status and Last Run */}
        <div className="mt-6 pt-6 border-t border-red-900/30 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 mb-1">
              Status
            </p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                automation.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : automation.status === "error"
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {automation.status === "active"
                ? "Ativa"
                : automation.status === "error"
                ? "Erro"
                : "Inativa"}
            </span>
          </div>
          {automation.lastRun && (
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">
                Última Execução
              </p>
              <p className="text-sm text-white">
                {automation.lastRun}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Automation Card for Execution */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Executar Automação
        </h2>
        {automation.id === "sharepoint" ? (
          <SharePointForm
            onExecute={async (clientId, monthId, clientName, monthName) => {
              await onExecute(automation.id, {
                clientId,
                monthId,
                clientName,
                monthName,
              });
            }}
            isExecuting={executing}
          />
        ) : automation.id === "clickup" ? (
          <ClickUpForm
            onExecute={async (clientId, clientName) => {
              await onExecute(automation.id, {
                clientId,
                clientName,
              });
            }}
            isExecuting={executing}
          />
        ) : (
          <AutomationCard
            title={automation.title}
            description={automation.description}
            icon={icon}
            status={automation.status}
            lastRun={automation.lastRun}
            onExecute={() => onExecute(automation.id)}
            isExecuting={executing}
          />
        )}
      </div>
    </div>
  );
}
