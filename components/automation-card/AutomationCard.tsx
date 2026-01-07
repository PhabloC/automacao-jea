import { AutomationCardProps } from "./types";
import { SpinnerIcon } from "@/svg";

export default function AutomationCard({
  title,
  description,
  icon,
  status,
  lastRun,
  onExecute,
  isExecuting = false,
}: AutomationCardProps) {
  const statusColors = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const statusText = {
    active: "Ativa",
    inactive: "Inativa",
    error: "Erro",
  };

  return (
    <div className="group relative bg-gray-900/50 rounded-xl shadow-sm border border-red-900/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Decorative gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-red-950 to-red-900"></div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-black to-red-950 rounded-lg group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {title}
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusColors[status]}`}
              >
                {statusText[status]}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {lastRun && (
          <div className="mb-4 text-xs text-gray-400">
            <span className="font-medium">Última execução:</span> {lastRun}
          </div>
        )}

        <button
          onClick={onExecute}
          disabled={isExecuting}
          className={`w-full mt-4 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 transform shadow-sm hover:shadow-md flex items-center justify-center gap-2 ${
            isExecuting
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-black to-red-950 text-white hover:from-gray-900 hover:to-red-900 hover:scale-[1.02] active:scale-[0.98]"
          }`}
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
    </div>
  );
}
