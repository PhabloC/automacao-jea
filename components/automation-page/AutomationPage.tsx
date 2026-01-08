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
          <div className="flex items-center justify-center w-16 h-16 bg-linear-to-br from-black to-red-950 rounded-xl">
            {icon}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {automation.title}
            </h1>
            <p className="text-gray-300 text-lg">{automation.description}</p>
          </div>
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
