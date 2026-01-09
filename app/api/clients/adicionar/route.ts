import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://gateway.jeamarketing.com.br/webhook/adicionar-cliente";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientes } = body;

    if (!clientes || typeof clientes !== "string" || !clientes.trim()) {
      return NextResponse.json(
        { error: "Nome do cliente é obrigatório" },
        { status: 400 }
      );
    }

    console.log("[API Clients] Adicionando cliente:", clientes);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientes: clientes.trim(),
      }),
    });

    console.log("[API Clients] Status da resposta:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error("[API Clients] Erro ao adicionar cliente:", response.status, errorText);
      return NextResponse.json(
        { error: `Erro ao adicionar cliente: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API Clients] Cliente adicionado com sucesso");

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API Clients] Erro ao adicionar cliente:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
