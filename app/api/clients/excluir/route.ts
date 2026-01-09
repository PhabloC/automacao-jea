import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://gateway.jeamarketing.com.br/webhook/excluir-cliente";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID do cliente é obrigatório" },
        { status: 400 }
      );
    }

    const idToSend = typeof id === "string" ? parseInt(id, 10) : id;

    if (isNaN(idToSend)) {
      return NextResponse.json(
        { error: `ID inválido: ${id}` },
        { status: 400 }
      );
    }

    console.log("[API Clients] Excluindo cliente com ID:", idToSend);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: idToSend,
      }),
    });

    console.log("[API Clients] Status da resposta:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error("[API Clients] Erro ao excluir cliente:", response.status, errorText);
      return NextResponse.json(
        { error: `Erro ao excluir cliente: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("[API Clients] Cliente excluído com sucesso");

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API Clients] Erro ao excluir cliente:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
