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
export const automationDefinitions: Omit<
  AutomationData,
  "executionCount" | "successCount" | "errorCount" | "status" | "lastRun"
>[] = [
  {
    id: "calendario",
    title: "Calendário",
    description:
      "Automação para criar tarefas de posts no calendário, organizando conteúdo por cliente e mês.",
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

// Interface para posts do calendário
export interface CalendarPost {
  id: string;
  titulo: string;
  formato: string;
  descricao: string;
  referencia: string;
}

// Executa uma automação
export async function executeAutomation(
  automationId: string,
  params?: {
    clientId?: string;
    monthId?: string;
    clientName?: string;
    monthName?: string;
    quantidadeDePost?: string;
    posts?: CalendarPost[];
  }
): Promise<ExecutionResult> {
  const now = new Date();
  const timeString = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Para Calendário, faz chamada real ao webhook do n8n
  if (
    automationId === "calendario" &&
    params?.clientId &&
    params?.monthId &&
    params?.posts
  ) {
    const webhookUrl = N8N_WEBHOOKS.calendario;

    if (!webhookUrl) {
      return {
        success: false,
        message: "Webhook não configurado para esta automação",
        timestamp: `Hoje às ${timeString}`,
      };
    }

    try {
      // Adiciona número (1, 2, 3...) em cada post para uso no loop do n8n (ex: pasta /1, /2, /3)
      const postsWithNumero = params.posts.map((post, index) => ({
        ...post,
        numero: index + 1,
      }));

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
          posts: postsWithNumero,
          postsCount: params.posts.length,
          quantidadeDePosts: params.posts.length,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const clientName = params.clientName || "o cliente selecionado";
        const monthName = params.monthName || "o mês selecionado";
        return {
          success: false,
          message: `Erro ao criar tarefas no calendário para ${clientName} - ${monthName}. Status: ${response.status}`,
          timestamp: `Hoje às ${timeString}`,
        };
      }

      const success = data?.success !== false;
      const postsCount = params.posts.length;
      const message =
        data?.message ||
        (success
          ? `${postsCount} tarefa${postsCount > 1 ? "s" : ""} criada${
              postsCount > 1 ? "s" : ""
            } com sucesso no calendário para ${params.clientName} - ${
              params.monthName
            }!`
          : `Erro ao criar tarefas no calendário para ${params.clientName} - ${params.monthName}. Tente novamente.`);

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
        message: `Erro ao conectar com o servidor. Não foi possível criar tarefas no calendário para ${clientName} - ${monthName}.`,
        timestamp: `Hoje às ${timeString}`,
      };
    }
  }

  // Para outras automações, retorna erro
  return {
    success: false,
    message: "Automação não implementada ou parâmetros inválidos",
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

    console.log(
      "[Client] Status da resposta:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Não foi possível ler o erro");
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
