import { N8N_WEBHOOKS } from "./config";

export interface AutomationData {
  id: string;
  title: string;
  description: string;
  status: "active" | "inactive" | "error";
  lastRun?: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
}

export interface ExecutionResult {
  success: boolean;
  message: string;
  timestamp: string;
}

// Definições das automações
export const automationDefinitions: Omit<AutomationData, "executionCount" | "successCount" | "errorCount" | "status" | "lastRun">[] = [
  {
    id: "sharepoint",
    title: "Criar Pasta no SharePoint",
    description:
      "Automação para criar pastas automaticamente no SharePoint com estrutura organizada e permissões configuradas.",
  },
  {
    id: "clickup",
    title: "Criar Tarefas no ClickUp",
    description:
      "Automação para criar tarefas no ClickUp de forma automatizada, organizando projetos e atribuindo responsáveis.",
  },
];

// Função para criar automações com valores iniciais zerados
export function createInitialAutomations(): AutomationData[] {
  return automationDefinitions.map((def) => ({
    ...def,
    status: "inactive" as const,
    executionCount: 0,
    successCount: 0,
    errorCount: 0,
  }));
}

// Executa uma automação
export async function executeAutomation(
  automationId: string,
  params?: { clientId?: string; monthId?: string; clientName?: string; monthName?: string }
): Promise<ExecutionResult> {
  const now = new Date();
  const timeString = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Para SharePoint, faz chamada real ao webhook do n8n
  if (automationId === "sharepoint" && params?.clientId && params?.monthId) {
    const webhookUrl = N8N_WEBHOOKS.sharepoint;
    
    if (!webhookUrl) {
      return {
        success: false,
        message: "Webhook não configurado para esta automação",
        timestamp: `Hoje às ${timeString}`,
      };
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: params.clientId,
          monthId: params.monthId,
          clientName: params.clientName,
          monthName: params.monthName,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const clientName = params.clientName || "o cliente selecionado";
        const monthName = params.monthName || "o mês selecionado";
        return {
          success: false,
          message: `Erro ao criar pasta para ${clientName} - ${monthName}. Status: ${response.status}`,
          timestamp: `Hoje às ${timeString}`,
        };
      }

      // Assume que o n8n retorna um objeto com success e message
      const success = data?.success !== false; // Considera sucesso se não for explicitamente false
      const message = data?.message || 
        (success 
          ? `Pasta criada com sucesso para ${params.clientName} - ${params.monthName}!`
          : `Erro ao criar pasta para ${params.clientName} - ${params.monthName}. Tente novamente.`);

      return {
        success,
        message,
        timestamp: `Hoje às ${timeString}`,
      };
    } catch (error) {
      const clientName = params.clientName || "o cliente selecionado";
      const monthName = params.monthName || "o mês selecionado";
      console.error("Erro ao chamar webhook:", error);
      
      return {
        success: false,
        message: `Erro ao conectar com o servidor. Não foi possível criar pasta para ${clientName} - ${monthName}.`,
        timestamp: `Hoje às ${timeString}`,
      };
    }
  }

  // Para outras automações (ClickUp por enquanto), simula a execução
  // Isso será atualizado quando o webhook do ClickUp estiver pronto
  const delay = Math.random() * 1500 + 1500;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const success = Math.random() > 0.05;

  let message = "";
  if (automationId === "clickup" && params?.clientId) {
    const clientName = params.clientName || "o cliente selecionado";
    message = success
      ? `Tarefas criadas com sucesso no ClickUp para ${clientName}!`
      : `Erro ao criar tarefas no ClickUp para ${clientName}. Tente novamente.`;
  } else {
    message = success
      ? `${automationId === "sharepoint" ? "Pasta" : "Tarefas"} criada(s) com sucesso!`
      : "Erro ao executar automação. Tente novamente.";
  }

  return {
    success,
    message,
    timestamp: `Hoje às ${timeString}`,
  };
}

// Função para formatar data relativa
export function formatRelativeTime(dateString: string): string {
  return dateString; // Por enquanto retorna como está
}

// Interface para estatísticas do n8n
export interface N8NStatistics {
  executionCount: number;
  successCount: number;
  errorCount: number;
  lastRun?: string;
  status: "active" | "inactive" | "error";
}

// Busca estatísticas reais do n8n
export async function fetchN8NStatistics(
  automationId: string
): Promise<N8NStatistics> {
  try {
    console.log("[Client] Buscando estatísticas para:", automationId);
    const response = await fetch(
      `/api/n8n/statistics?automationId=${automationId}`
    );

    console.log("[Client] Status da resposta:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Não foi possível ler o erro");
      console.error(
        `[Client] Erro ao buscar estatísticas: ${response.status} ${response.statusText}`,
        errorText
      );
      return {
        executionCount: 0,
        successCount: 0,
        errorCount: 0,
        status: "error",
      };
    }

    const data: N8NStatistics = await response.json();
    console.log("[Client] Estatísticas recebidas:", data);
    return data;
  } catch (error) {
    console.error("[Client] Erro ao buscar estatísticas do n8n:", error);
    if (error instanceof Error) {
      console.error("[Client] Mensagem:", error.message);
    }
    return {
      executionCount: 0,
      successCount: 0,
      errorCount: 0,
      status: "error",
    };
  }
}

