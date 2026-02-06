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
  return user;
}

async function checkHasPermission(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  return !!data;
}

/**
 * POST – Sincroniza nome, e-mail e telefone dos relatórios vinculados a um cliente
 * quando os dados do cliente são atualizados na página de clientes.
 * Body: { oldNome, oldEmail, newNome, newEmail, newTelefone }
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const hasPermission = await checkHasPermission(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Sem permissão para acessar esta automação." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      oldNome,
      oldEmail,
      newNome,
      newEmail,
      newTelefone,
    } = body as {
      oldNome?: unknown;
      oldEmail?: unknown;
      newNome?: unknown;
      newEmail?: unknown;
      newTelefone?: unknown;
    };

    if (
      typeof oldNome !== "string" ||
      !oldNome.trim() ||
      typeof oldEmail !== "string" ||
      !oldEmail.trim()
    ) {
      return NextResponse.json(
        { error: "oldNome e oldEmail são obrigatórios para identificar o cliente" },
        { status: 400 }
      );
    }

    const nomeNew = typeof newNome === "string" ? newNome.trim() : oldNome.trim();
    const emailNew =
      typeof newEmail === "string" ? newEmail.trim() : oldEmail.trim();
    const telefoneNew =
      typeof newTelefone === "string" ? newTelefone.trim() : "";

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({
        nome: nomeNew,
        email: emailNew,
        telefone: telefoneNew,
      })
      .eq("nome", oldNome.trim())
      .eq("email", oldEmail.trim())
      .select("id");

    if (error) {
      console.error("[API Relatorios] Erro ao sincronizar:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao sincronizar relatórios" },
        { status: 500 }
      );
    }

    const updatedCount = data?.length ?? 0;
    return NextResponse.json({
      success: true,
      updatedCount,
      message:
        updatedCount > 0
          ? `${updatedCount} relatório(s) atualizado(s) com os novos dados do cliente.`
          : "Nenhum relatório vinculado a este cliente.",
    });
  } catch (err) {
    console.error("[API Relatorios] Erro em sync:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
