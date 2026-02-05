import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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

const TABLE = "relatorios_clientes";

// GET – Listar clientes de relatórios
export async function GET(request: NextRequest) {
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

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("*")
      .order("nome");

    if (error) {
      console.error("[API Relatorios] Erro ao listar:", error);
      return NextResponse.json(
        { error: "Erro ao listar clientes" },
        { status: 500 }
      );
    }

    const clientes = (data || []).map((row: Record<string, unknown>) => ({
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
      campanha_google: !!row.campanha_google,
      mensagem_meta: row.mensagem_meta ?? null,
      mensagem_google: row.mensagem_google ?? null,
    }));

    return NextResponse.json({ clientes });
  } catch (err) {
    console.error("[API Relatorios] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST – Criar cliente
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      nome,
      email,
      telefone,
      conta_anuncio_meta,
      conta_anuncio_google,
      dias_envio,
      quantidade_dias_relatorio,
      campanha_meta,
      saldo_meta,
      campanha_google,
      mensagem_meta,
      mensagem_google,
    } = body;

    if (!nome?.trim() || !email?.trim() || !telefone?.trim()) {
      return NextResponse.json(
        { error: "Nome, e-mail e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    const diasEnvioArray = Array.isArray(dias_envio) ? dias_envio : [];
    if (diasEnvioArray.length === 0) {
      return NextResponse.json(
        { error: "Selecione pelo menos um dia de envio" },
        { status: 400 }
      );
    }

    const periodo = Number(quantidade_dias_relatorio);
    if (![1, 7, 15, 30].includes(periodo)) {
      return NextResponse.json(
        { error: "Período do relatório deve ser 1, 7, 15 ou 30 dias" },
        { status: 400 }
      );
    }

    const row = {
      nome: String(nome).trim(),
      email: String(email).trim(),
      telefone: String(telefone).trim(),
      conta_anuncio_meta: conta_anuncio_meta
        ? String(conta_anuncio_meta).trim() || null
        : null,
      conta_anuncio_google: conta_anuncio_google
        ? String(conta_anuncio_google).trim() || null
        : null,
      dias_envio: diasEnvioArray,
      quantidade_dias_relatorio: periodo,
      campanha_meta: !!campanha_meta,
      saldo_meta: !!saldo_meta,
      campanha_google: !!campanha_google,
      mensagem_meta: mensagem_meta != null ? String(mensagem_meta) : null,
      mensagem_google: mensagem_google != null ? String(mensagem_google) : null,
    };

    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("[API Relatorios] Erro ao criar:", error);
      return NextResponse.json(
        { error: error.message || "Erro ao criar cliente" },
        { status: 500 }
      );
    }

    const cliente = {
      id: data.id,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      conta_anuncio_meta: data.conta_anuncio_meta ?? null,
      conta_anuncio_google: data.conta_anuncio_google ?? null,
      dias_envio: Array.isArray(data.dias_envio) ? data.dias_envio : [],
      quantidade_dias_relatorio: data.quantidade_dias_relatorio ?? 7,
      campanha_meta: !!data.campanha_meta,
      saldo_meta: !!data.saldo_meta,
      campanha_google: !!data.campanha_google,
      mensagem_meta: data.mensagem_meta ?? null,
      mensagem_google: data.mensagem_google ?? null,
    };

    return NextResponse.json({ cliente });
  } catch (err) {
    console.error("[API Relatorios] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
