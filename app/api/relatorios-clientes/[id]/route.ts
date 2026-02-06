import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const TABLE = "relatorios_clientes";

async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return { user, token };
}

async function checkHasPermission(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  return !!data;
}

function mapRowToCliente(row: Record<string, unknown>) {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    conta_anuncio_meta: row.conta_anuncio_meta ?? null,
    conta_anuncio_google: row.conta_anuncio_google ?? null,
    dias_envio: Array.isArray(row.dias_envio) ? row.dias_envio : [],
    quantidade_dias_relatorio: row.quantidade_dias_relatorio ?? 7,
    campanha_meta: !!row.campanha_meta,
    saldo_meta: !!row.saldo_meta,
    avisar_saldo_abaixo_de:
      row.avisar_saldo_abaixo_de != null
        ? Number(row.avisar_saldo_abaixo_de)
        : null,
    campanha_google: !!row.campanha_google,
    mensagem_meta: row.mensagem_meta ?? null,
    mensagem_google: row.mensagem_google ?? null,
  };
}

// PATCH – Atualizar cliente (inclui toggles e mensagens)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const hasPermission = await checkHasPermission(auth.user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Sem permissão para acessar esta automação." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const allowedKeys = [
      "nome",
      "email",
      "telefone",
      "conta_anuncio_meta",
      "conta_anuncio_google",
      "dias_envio",
      "quantidade_dias_relatorio",
      "campanha_meta",
      "saldo_meta",
      "avisar_saldo_abaixo_de",
      "campanha_google",
      "mensagem_meta",
      "mensagem_google",
    ];
    const update: Record<string, unknown> = {};
    for (const key of allowedKeys) {
      if (key in body) {
        const value = body[key];
        if (key === "dias_envio") {
          update[key] = Array.isArray(value) ? value : [];
        } else if (key === "quantidade_dias_relatorio") {
          const n = Number(value);
          if ([1, 7, 15, 30].includes(n)) update[key] = n;
        } else if (key === "nome" || key === "email" || key === "telefone") {
          if (value != null) update[key] = String(value).trim();
        } else if (
          key === "conta_anuncio_meta" ||
          key === "conta_anuncio_google" ||
          key === "mensagem_meta" ||
          key === "mensagem_google"
        ) {
          update[key] = value != null && value !== "" ? String(value) : null;
        } else if (key === "avisar_saldo_abaixo_de") {
          if (value == null || value === "") {
            update[key] = null;
          } else {
            const n = Number(value);
            update[key] = Number.isNaN(n) ? null : n;
          }
        } else if (
          key === "campanha_meta" ||
          key === "saldo_meta" ||
          key === "campanha_google"
        ) {
          update[key] = !!value;
        }
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo válido para atualizar" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(update)
      .eq("id", idNum)
      .select()
      .single();

    if (error) {
      console.error("[API Relatorios] Erro ao atualizar:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao atualizar cliente" },
        { status: 500 }
      );
    }

    return NextResponse.json({ cliente: mapRowToCliente(data) });
  } catch (err) {
    console.error("[API Relatorios] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE – Excluir cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const hasPermission = await checkHasPermission(auth.user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Sem permissão para acessar esta automação." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum) || idNum <= 0) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", idNum);

    if (error) {
      console.error("[API Relatorios] Erro ao excluir:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao excluir cliente" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API Relatorios] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
