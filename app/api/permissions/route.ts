import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente com service role para operações administrativas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// GET - Listar todos os usuários com permissões
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o usuário que está fazendo a requisição é admin
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar se é admin
    const { data: currentUserRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!currentUserRole || currentUserRole.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem acessar." },
        { status: 403 }
      );
    }

    // Buscar todas as permissões
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar permissões:", error);
      return NextResponse.json(
        { error: "Erro ao buscar permissões" },
        { status: 500 }
      );
    }

    return NextResponse.json({ permissions: data });
  } catch (error) {
    console.error("Erro na API de permissões:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Adicionar ou atualizar permissão de usuário
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar se é admin
    const { data: currentUserRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!currentUserRole || currentUserRole.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem modificar permissões." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_id, email, full_name, avatar_url, role } = body;

    if (!user_id || !email || !role) {
      return NextResponse.json(
        { error: "Campos obrigatórios: user_id, email, role" },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "editor") {
      return NextResponse.json(
        { error: "Role deve ser 'admin' ou 'editor'" },
        { status: 400 }
      );
    }

    // Verificar se já existe permissão para este usuário
    const { data: existingPermission } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (existingPermission) {
      // Atualizar permissão existente
      const { error } = await supabaseAdmin
        .from("user_roles")
        .update({ role, full_name, avatar_url })
        .eq("user_id", user_id);

      if (error) {
        console.error("Erro ao atualizar permissão:", error);
        return NextResponse.json(
          { error: "Erro ao atualizar permissão" },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "Permissão atualizada com sucesso" });
    } else {
      // Criar nova permissão
      const { error } = await supabaseAdmin.from("user_roles").insert({
        user_id,
        email,
        full_name,
        avatar_url,
        role,
        created_by: user.id,
      });

      if (error) {
        console.error("Erro ao criar permissão:", error);
        return NextResponse.json(
          { error: "Erro ao criar permissão" },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "Permissão criada com sucesso" });
    }
  } catch (error) {
    console.error("Erro na API de permissões:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Remover permissão de usuário
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar se é admin
    const { data: currentUserRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!currentUserRole || currentUserRole.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem remover permissões." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    // Não permitir que o admin remova a própria permissão
    if (userId === user.id) {
      return NextResponse.json(
        { error: "Você não pode remover sua própria permissão" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao remover permissão:", error);
      return NextResponse.json(
        { error: "Erro ao remover permissão" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Permissão removida com sucesso" });
  } catch (error) {
    console.error("Erro na API de permissões:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
