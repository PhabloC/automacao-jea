import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL =
  "https://gateway.jeamarketing.com.br/webhook/adicionar-cliente";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientes, email, telefone } = body as {
      clientes?: unknown;
      email?: unknown;
      telefone?: unknown;
    };

    if (!clientes || typeof clientes !== "string" || !clientes.trim()) {
      return NextResponse.json(
        { error: "Nome do cliente é obrigatório" },
        { status: 400 }
      );
    }

    const payload: Record<string, string> = {
      clientes: clientes.trim(),
    };
    if (typeof email === "string" && email.trim()) payload.email = email.trim();
    if (typeof telefone === "string" && telefone.trim())
      payload.telefone = telefone.trim();

    console.log("[API Clients] Adicionando cliente:", payload);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log(
      "[API Clients] Status da resposta:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Erro desconhecido");
      console.error(
        "[API Clients] Erro ao adicionar cliente:",
        response.status,
        errorText
      );
      return NextResponse.json(
        { error: `Erro ao adicionar cliente: ${response.status}` },
        { status: response.status }
      );
    }

    // Processar resposta do webhook
    let clientData = null;
    const contentType = response.headers.get("content-type");
    const responseText = await response.text();

    if (responseText) {
      if (contentType?.includes("application/json")) {
        try {
          clientData = JSON.parse(responseText);
        } catch {
          console.warn(
            "[API Clients] Resposta não é JSON válido, mas continua"
          );
        }
      } else {
        console.warn("[API Clients] Resposta não é JSON:", contentType);
      }
    }

    // Extrair o cliente criado da resposta
    let createdClient = null;
    if (clientData) {
      // Pode retornar em diferentes formatos
      if (clientData.id && clientData.clientes) {
        // Formato direto: { id, clientes }
        createdClient = {
          id: String(clientData.id),
          name: clientData.clientes,
        };
      } else if (
        clientData.data &&
        clientData.data.id &&
        clientData.data.clientes
      ) {
        // Formato com wrapper: { data: { id, clientes } }
        createdClient = {
          id: String(clientData.data.id),
          name: clientData.data.clientes,
        };
      } else if (Array.isArray(clientData) && clientData.length > 0) {
        // Formato array
        const item = clientData[0];
        if (item.id && item.clientes) {
          createdClient = {
            id: String(item.id),
            name: item.clientes,
          };
        }
      }
    }

    console.log("[API Clients] Cliente adicionado com sucesso:", createdClient);

    return NextResponse.json(
      { success: true, data: clientData, client: createdClient },
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
