import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://gateway.jeamarketing.com.br/webhook/listar-clientes";

export async function GET(request: NextRequest) {
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

    console.log("[API Clients] Status da resposta:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error("[API Clients] Erro ao buscar clientes:", response.status, errorText);
      return NextResponse.json(
        { error: `Erro ao buscar clientes: ${response.status}`, clients: [] },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API Clients] Resposta recebida:", { hasData: !!data, isArray: Array.isArray(data) });

    // Processar formato específico do webhook n8n:
    // [{ data: [{ clientes: "...", id: 1, ... }] }]
    let clients: Array<{ id: string; name: string }> = [];

    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem?.data && Array.isArray(firstItem.data)) {
        clients = firstItem.data
          .map((item: any) => ({
            id: String(item.id),
            name: item.clientes || "",
          }))
          .filter((client: any) => client.id && client.name && client.name.trim());
      }
    }

    console.log("[API Clients] Clientes processados:", clients.length);

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
