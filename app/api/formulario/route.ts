import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = "https://gateway.jeamarketing.com.br/webhook/formulario";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return NextResponse.json(
        { error: "Webhook retornou erro", details: text.slice(0, 200) },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(data, { status: 200 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao enviar formulário";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
