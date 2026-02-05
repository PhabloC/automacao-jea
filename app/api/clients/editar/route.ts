import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL =
  "https://gateway.jeamarketing.com.br/webhook/editar-cliente";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, clientes, email, telefone } = body as {
      id?: unknown;
      clientes?: unknown;
      email?: unknown;
      telefone?: unknown;
    };

    if (!id) {
      return NextResponse.json(
        { error: "ID do cliente é obrigatório" },
        { status: 400 }
      );
    }

    if (!clientes || typeof clientes !== "string" || !clientes.trim()) {
      return NextResponse.json(
        { error: "Nome do cliente é obrigatório" },
        { status: 400 }
      );
    }

    const idToSend = typeof id === "string" ? parseInt(id, 10) : Number(id);

    if (isNaN(idToSend) || idToSend <= 0) {
      return NextResponse.json(
        { error: `ID inválido: ${id}` },
        { status: 400 }
      );
    }

    const payload: Record<string, string | number> = {
      id: idToSend,
      clientes: clientes.trim(),
    };
    if (typeof email === "string" && email.trim()) payload.email = email.trim();
    if (typeof telefone === "string" && telefone.trim())
      payload.telefone = telefone.trim();

    console.log("[API Clients] Editando cliente:", payload);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text().catch(() => "");

    if (!response.ok) {
      let errorMessage = `Erro ao editar cliente: ${response.status}`;
      try {
        const errorJson = responseText ? JSON.parse(responseText) : null;
        if (errorJson?.error) errorMessage = errorJson.error;
        else if (errorJson?.message) errorMessage = errorJson.message;
        else if (responseText?.trim()) errorMessage = responseText.trim();
      } catch {
        if (responseText?.trim()) errorMessage = responseText.trim();
      }
      console.error("[API Clients] Erro ao editar cliente:", response.status, responseText);
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    let clientData = null;
    const contentType = response.headers.get("content-type");

    if (responseText && contentType?.includes("application/json")) {
      try {
        clientData = JSON.parse(responseText);
      } catch {
        console.warn("[API Clients] Resposta não é JSON válido");
      }
    }

    let updatedClient = null;
    if (clientData) {
      if (clientData.id && clientData.clientes) {
        updatedClient = {
          id: String(clientData.id),
          name: clientData.clientes,
        };
      } else if (clientData.data?.id && clientData.data?.clientes) {
        updatedClient = {
          id: String(clientData.data.id),
          name: clientData.data.clientes,
        };
      } else {
        updatedClient = {
          id: String(idToSend),
          name: clientes.trim(),
        };
      }
    } else {
      updatedClient = {
        id: String(idToSend),
        name: clientes.trim(),
      };
    }

    console.log("[API Clients] Cliente editado com sucesso:", updatedClient);

    return NextResponse.json(
      { success: true, data: clientData, client: updatedClient },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API Clients] Erro ao editar cliente:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
