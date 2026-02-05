import { NextRequest, NextResponse } from "next/server";
import { N8N_CONFIG } from "@/lib/config";

interface N8NExecution {
  id: string;
  finished: boolean;
  stoppedAt?: string;
  startedAt: string;
  workflowId: string;
  mode: string;
  retryOf?: string;
  retrySuccess?: boolean;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
  };
}

interface AutomationStatistics {
  executionCount: number;
  successCount: number;
  errorCount: number;
  lastRun?: string;
  status: "active" | "inactive" | "error";
}

export async function GET(request: NextRequest) {
  void request; // usado pela assinatura da rota Next.js
  try {
    const { searchParams } = new URL(request.url);
    const automationId = searchParams.get("automationId");

    console.log("[N8N Statistics] Iniciando busca para:", automationId);

    if (!automationId) {
      return NextResponse.json(
        { error: "automationId é obrigatório" },
        { status: 400 }
      );
    }

    const workflowId =
      N8N_CONFIG.workflowIds[
        automationId as keyof typeof N8N_CONFIG.workflowIds
      ];

    console.log("[N8N Statistics] Workflow ID:", workflowId);
    console.log("[N8N Statistics] Base URL:", N8N_CONFIG.baseUrl);
    console.log("[N8N Statistics] API Key configurada:", !!N8N_CONFIG.apiKey);

    if (!workflowId) {
      console.warn(
        "[N8N Statistics] Workflow ID não encontrado para:",
        automationId
      );
      return NextResponse.json(
        {
          executionCount: 0,
          successCount: 0,
          errorCount: 0,
          status: "inactive",
        } as AutomationStatistics,
        { status: 200 }
      );
    }

    if (!N8N_CONFIG.apiKey) {
      console.warn("[N8N Statistics] N8N_API_KEY não configurada");
      return NextResponse.json(
        {
          executionCount: 0,
          successCount: 0,
          errorCount: 0,
          status: "inactive",
        } as AutomationStatistics,
        { status: 200 }
      );
    }

    // Buscar execuções do n8n
    // Garantir que a URL base termina sem barra
    const baseUrl = N8N_CONFIG.baseUrl.replace(/\/$/, "");
    const apiUrl = `${baseUrl}/api/v1/executions`;
    const url = new URL(apiUrl);
    url.searchParams.append("workflowId", workflowId);
    url.searchParams.append("limit", "100"); // Limitar a 100 execuções mais recentes

    // n8n pode usar diferentes formatos de autenticação
    // Tenta primeiro com X-N8N-API-KEY (mais comum)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Adiciona autenticação - n8n pode usar X-N8N-API-KEY ou Authorization Bearer
    if (N8N_CONFIG.apiKey.startsWith("Bearer ")) {
      headers["Authorization"] = N8N_CONFIG.apiKey;
    } else {
      headers["X-N8N-API-KEY"] = N8N_CONFIG.apiKey;
    }

    console.log("[N8N Statistics] Fazendo requisição para:", url.toString());
    console.log("[N8N Statistics] Headers:", {
      ...headers,
      "X-N8N-API-KEY": headers["X-N8N-API-KEY"] ? "***" : undefined,
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    console.log(
      "[N8N Statistics] Status da resposta:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Não foi possível ler o erro");
      console.error(
        `[N8N Statistics] Erro ao buscar execuções do n8n: ${response.status} ${response.statusText}`,
        errorText
      );
      return NextResponse.json(
        {
          executionCount: 0,
          successCount: 0,
          errorCount: 0,
          status: "error",
        } as AutomationStatistics,
        { status: 200 }
      );
    }

    const responseData = await response.json();
    console.log("[N8N Statistics] Resposta recebida:", {
      hasData: !!responseData.data,
      dataLength: responseData.data?.length || 0,
      keys: Object.keys(responseData),
    });

    // A resposta pode vir em diferentes formatos
    let executions: N8NExecution[] = [];
    if (Array.isArray(responseData)) {
      executions = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      executions = responseData.data;
    } else if (responseData.results && Array.isArray(responseData.results)) {
      executions = responseData.results;
    }

    console.log("[N8N Statistics] Execuções encontradas:", executions.length);

    // Calcular estatísticas
    const executionCount = executions.length;
    const successCount = executions.filter(
      (exec) => exec.finished && !exec.error
    ).length;
    const errorCount = executions.filter((exec) => exec.error).length;

    // Encontrar última execução
    let lastRun: string | undefined;
    if (executions.length > 0) {
      const lastExecution = executions[0]; // Execuções vêm ordenadas por data (mais recente primeiro)
      if (lastExecution.stoppedAt) {
        const date = new Date(lastExecution.stoppedAt);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
          lastRun = `Há ${diffMins} minuto${diffMins !== 1 ? "s" : ""}`;
        } else if (diffHours < 24) {
          lastRun = `Há ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
        } else if (diffDays < 7) {
          lastRun = `Há ${diffDays} dia${diffDays !== 1 ? "s" : ""}`;
        } else {
          lastRun = date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      }
    }

    // Determinar status
    let status: "active" | "inactive" | "error" = "active";
    if (errorCount > 0 && errorCount === executionCount) {
      status = "error";
    } else if (executionCount === 0) {
      status = "inactive";
    }

    const statistics: AutomationStatistics = {
      executionCount,
      successCount,
      errorCount,
      lastRun,
      status,
    };

    console.log("[N8N Statistics] Estatísticas calculadas:", statistics);

    return NextResponse.json(statistics);
  } catch (error) {
    console.error(
      "[N8N Statistics] Erro ao buscar estatísticas do n8n:",
      error
    );
    if (error instanceof Error) {
      console.error("[N8N Statistics] Mensagem de erro:", error.message);
      console.error("[N8N Statistics] Stack:", error.stack);
    }
    return NextResponse.json(
      {
        executionCount: 0,
        successCount: 0,
        errorCount: 0,
        status: "error",
      } as AutomationStatistics,
      { status: 200 }
    );
  }
}
