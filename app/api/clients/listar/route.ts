import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL =
  "https://gateway.jeamarketing.com.br/webhook/listar-clientes";

export async function GET(request: NextRequest) {
  void request; // usado pela assinatura da rota Next.js
  try {
    console.log("[API Clients] Buscando clientes do webhook:", WEBHOOK_URL);

    const response = await fetch(WEBHOOK_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Adicionar cache revalidation
      next: { revalidate: 0 },
    });

    console.log(
      "[API Clients] Status da resposta:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error(
        "[API Clients] Erro ao buscar clientes:",
        response.status,
        errorText
      );
      return NextResponse.json(
        { error: `Erro ao buscar clientes: ${response.status}`, clients: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API Clients] Resposta recebida:", {
      hasData: !!data,
      isArray: Array.isArray(data),
    });

    // Processar formato específico do webhook n8n:
    // [{ data: [{ clientes: "...", id: 1, email?: "...", telefone?: "..." }] }]
    type WebhookItem = {
      id?: unknown;
      clientes?: string;
      email?: string;
      telefone?: string;
    };
    type ClientItem = {
      id: string;
      name: string;
      email?: string;
      telefone?: string;
    };
    let clients: ClientItem[] = [];

    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem?.data && Array.isArray(firstItem.data)) {
        clients = firstItem.data
          .map((item: WebhookItem) => ({
            id: String(item.id),
            name: (item.clientes || "").trim(),
            email:
              typeof item.email === "string" ? item.email.trim() : undefined,
            telefone:
              typeof item.telefone === "string"
                ? item.telefone.trim()
                : undefined,
          }))
          .filter((client: ClientItem) => client.id && client.name);
      }
    }

    console.log("[API Clients] Clientes processados:", clients.length);

    // Log dos IDs para debug
    if (clients.length > 0) {
      console.log(
        "[API Clients] IDs dos clientes:",
        clients.map((c) => ({ id: c.id, name: c.name }))
      );
    }

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error) {
    console.error("[API Clients] Erro ao buscar clientes:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro desconhecido",
        clients: [],
      },
      { status: 500 }
    );
  }
}
