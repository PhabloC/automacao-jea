import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

type TaskPostRow = {
  id: string;
  titulo: string;
  formato: string;
  canais: string;
  dataPublicacao: string;
  descricao: string;
  referencia: string;
};

type TaskRow = {
  id: string;
  automation_id: string;
  automation_name: string;
  client_id: string;
  client_name: string;
  month_id: string | null;
  month_name: string | null;
  posts_count: number | null;
  posts: TaskPostRow[] | null;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar: string | null;
  success: boolean;
  message: string;
  created_at: string;
};

const mapRowToTask = (row: TaskRow) => ({
  id: row.id,
  automationId: row.automation_id,
  automationName: row.automation_name,
  clientId: row.client_id,
  clientName: row.client_name,
  monthId: row.month_id ?? undefined,
  monthName: row.month_name ?? undefined,
  postsCount: row.posts_count ?? undefined,
  posts: Array.isArray(row.posts) ? row.posts : undefined,
  userId: row.user_id,
  userName: row.user_name,
  userEmail: row.user_email,
  userAvatar: row.user_avatar ?? undefined,
  success: row.success,
  message: row.message,
  createdAt: row.created_at,
});

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

async function checkIsAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  return data?.role === "admin";
}

// GET – Listar tarefas (apenas admin)
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(auth.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Acesso negado. Apenas administradores podem listar tarefas.",
        },
        { status: 403 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("automation_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API Tasks] Erro ao buscar tarefas:", error);
      return NextResponse.json(
        { error: "Erro ao buscar tarefas" },
        { status: 500 },
      );
    }

    const tasks = (data as TaskRow[]).map(mapRowToTask);
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("[API Tasks] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

// POST – Criar tarefa (qualquer usuário com permissão)
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const hasPermission = await checkHasPermission(auth.user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "Acesso negado. Sem permissão para criar tarefas." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      automationId,
      automationName,
      clientId,
      clientName,
      monthId,
      monthName,
      postsCount,
      posts,
      userId,
      userName,
      userEmail,
      userAvatar,
      success,
      message,
    } = body;

    if (
      !automationId ||
      !automationName ||
      !clientId ||
      !clientName ||
      userId == null ||
      !userName ||
      !userEmail ||
      typeof success !== "boolean" ||
      !message
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes na tarefa" },
        { status: 400 },
      );
    }

    const insertPayload = {
      automation_id: automationId,
      automation_name: automationName,
      client_id: clientId,
      client_name: clientName,
      month_id: monthId ?? null,
      month_name: monthName ?? null,
      posts_count: postsCount ?? null,
      posts: Array.isArray(posts) ? posts : null,
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      user_avatar: userAvatar ?? null,
      success,
      message,
    };

    let result = await supabaseAdmin
      .from("automation_tasks")
      .insert(insertPayload)
      .select("id, created_at")
      .single();

    // Fallback: se a coluna "posts" não existir no banco (produção antiga), tenta sem ela
    if (result.error) {
      const errMsg = String(result.error.message || "").toLowerCase();
      const isPostsColumnError =
        errMsg.includes("posts") ||
        errMsg.includes("column") ||
        errMsg.includes("does not exist");

      if (isPostsColumnError) {
        const { posts: _posts, ...payloadWithoutPosts } = insertPayload;
        result = await supabaseAdmin
          .from("automation_tasks")
          .insert(payloadWithoutPosts)
          .select("id, created_at")
          .single();
      }
    }

    if (result.error) {
      console.error("[API Tasks] Erro ao criar tarefa:", result.error);
      return NextResponse.json(
        { error: "Erro ao criar tarefa" },
        { status: 500 },
      );
    }

    const data = result.data;

    const row = data as { id: string; created_at: string };
    return NextResponse.json({
      id: row.id,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error("[API Tasks] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

// DELETE – Remover tarefa (apenas admin)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const isAdmin = await checkIsAdmin(auth.user.id);
    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Acesso negado. Apenas administradores podem excluir tarefas.",
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Parâmetro id é obrigatório" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("automation_tasks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[API Tasks] Erro ao excluir tarefa:", error);
      return NextResponse.json(
        { error: "Erro ao excluir tarefa" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API Tasks] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
