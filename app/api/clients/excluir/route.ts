import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL =
  "https://gateway.jeamarketing.com.br/webhook/excluir-cliente";

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

    // Garantir que o ID seja um número válido
    const idToSend = typeof id === "string" ? parseInt(id, 10) : Number(id);

    if (isNaN(idToSend) || idToSend <= 0) {
      console.error("[API Clients] ID inválido recebido:", {
        id,
        type: typeof id,
        parsed: idToSend,
      });
      return NextResponse.json(
        { error: `ID inválido: ${id}` },
        { status: 400 }
      );
    }

    console.log(
      "[API Clients] Excluindo cliente com ID:",
      idToSend,
      "(tipo:",
      typeof idToSend,
      ")"
    );
    console.log("[API Clients] URL do webhook:", WEBHOOK_URL);

    // Tentar DELETE com body primeiro (alguns webhooks aceitam)
    let response = await fetch(WEBHOOK_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: idToSend,
      }),
    });

    // Se falhar, tentar com ID na URL
    if ((!response.ok && response.status === 405) || response.status === 400) {
      console.log("[API Clients] Tentando DELETE com ID na URL...");
      const urlWithId = `${WEBHOOK_URL}?id=${idToSend}`;
      response = await fetch(urlWithId, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.log(
      "[API Clients] Status da resposta:",
      response.status,
      response.statusText
    );
    console.log(
      "[API Clients] Headers da resposta:",
      Object.fromEntries(response.headers.entries())
    );

    // Ler a resposta antes de verificar ok
    const contentType = response.headers.get("content-type");
    const responseText = await response.text();

    console.log(
      "[API Clients] Resposta do webhook:",
      responseText.substring(0, 500)
    );

    if (!response.ok) {
      console.error("[API Clients] Erro ao excluir cliente:", {
        status: response.status,
        statusText: response.statusText,
        response: responseText,
      });
      return NextResponse.json(
        {
          error: `Erro ao excluir cliente: ${response.status} ${response.statusText}`,
          details: responseText.substring(0, 200),
        },
        { status: response.status }
      );
    }

    // Verificar se a resposta tem conteúdo antes de tentar parsear JSON
    let data = null;
    if (responseText && contentType?.includes("application/json")) {
      try {
        data = JSON.parse(responseText);
        console.log("[API Clients] Resposta parseada:", data);
      } catch (parseError) {
        console.warn("[API Clients] Resposta não é JSON válido:", parseError);
      }
    }

    // Verificar se realmente deletou - recarregar lista e verificar se o ID ainda existe
    console.log(
      "[API Clients] Verificando se cliente foi realmente excluído..."
    );
    const verifyResponse = await fetch(
      "https://gateway.jeamarketing.com.br/webhook/listar-clientes"
    );
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      if (Array.isArray(verifyData) && verifyData.length > 0) {
        const firstItem = verifyData[0];
        if (firstItem?.data && Array.isArray(firstItem.data)) {
          const clientExists = firstItem.data.some(
            (item: { id?: string | number }) =>
              String(item.id) === String(idToSend)
          );
          if (clientExists) {
            console.warn(
              "[API Clients] ATENÇÃO: Cliente ainda existe após exclusão!"
            );
            return NextResponse.json(
              {
                error:
                  "Cliente não foi excluído. O webhook pode não estar funcionando corretamente.",
                success: false,
              },
              { status: 500 }
            );
          } else {
            console.log(
              "[API Clients] Cliente confirmado como excluído (não está mais na lista)"
            );
          }
        }
      }
    }

    console.log("[API Clients] Cliente excluído com sucesso");

    return NextResponse.json(
      {
        success: true,
        data: data || { message: "Cliente excluído com sucesso" },
      },
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
