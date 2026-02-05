import { NextRequest, NextResponse } from "next/server";
import { N8N_CONFIG } from "@/lib/config";

interface TestResult {
  name: string;
  status: string;
  message: string;
  url?: string;
  responseKeys?: string[];
  isArray?: boolean;
  hasData?: boolean;
}

export async function GET(request: NextRequest) {
  void request; // usado pela assinatura da rota Next.js
  const testResults: {
    config: Record<string, unknown>;
    tests: TestResult[];
  } = {
    config: {
      baseUrl: N8N_CONFIG.baseUrl,
      hasApiKey: !!N8N_CONFIG.apiKey,
      apiKeyLength: N8N_CONFIG.apiKey?.length || 0,
      workflowIds: N8N_CONFIG.workflowIds,
    },
    tests: [],
  };

  // Teste 1: Verificar se a API Key está configurada
  if (!N8N_CONFIG.apiKey) {
    testResults.tests.push({
      name: "API Key",
      status: "error",
      message: "N8N_API_KEY não está configurada no arquivo .env",
    });
  } else {
    testResults.tests.push({
      name: "API Key",
      status: "success",
      message: "API Key configurada",
    });
  }

  // Teste 2: Verificar se o workflow ID está configurado
  if (!N8N_CONFIG.workflowIds.calendario) {
    testResults.tests.push({
      name: "Workflow ID Calendário",
      status: "error",
      message: "N8N_WORKFLOW_ID_CALENDARIO não está configurado",
    });
  } else {
    testResults.tests.push({
      name: "Workflow ID Calendário",
      status: "success",
      message: `Workflow ID: ${N8N_CONFIG.workflowIds.calendario}`,
    });
  }

  // Teste 3: Tentar fazer uma requisição de teste
  if (N8N_CONFIG.apiKey && N8N_CONFIG.workflowIds.calendario) {
    try {
      const baseUrl = N8N_CONFIG.baseUrl.replace(/\/$/, "");
      const apiUrl = `${baseUrl}/api/v1/executions`;
      const url = new URL(apiUrl);
      url.searchParams.append("workflowId", N8N_CONFIG.workflowIds.calendario);
      url.searchParams.append("limit", "1");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (N8N_CONFIG.apiKey.startsWith("Bearer ")) {
        headers["Authorization"] = N8N_CONFIG.apiKey;
      } else {
        headers["X-N8N-API-KEY"] = N8N_CONFIG.apiKey;
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
      });

      testResults.tests.push({
        name: "Teste de Conexão",
        status: response.ok ? "success" : "error",
        message: `Status: ${response.status} ${response.statusText}`,
        url: url.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        testResults.tests.push({
          name: "Formato da Resposta",
          status: "success",
          message: "Resposta recebida com sucesso",
          responseKeys: Object.keys(data),
          isArray: Array.isArray(data),
          hasData: !!data.data,
        });
      } else {
        const errorText = await response.text().catch(() => "");
        testResults.tests.push({
          name: "Erro na Resposta",
          status: "error",
          message: errorText.substring(0, 200),
        });
      }
    } catch (error) {
      testResults.tests.push({
        name: "Teste de Conexão",
        status: "error",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  return NextResponse.json(testResults, { status: 200 });
}
