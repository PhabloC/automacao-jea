import { supabase } from "./supabase";

export type UserRole = "admin" | "editor";

export interface UserPermission {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Buscar a role do usuário atual
export async function getCurrentUserRole(userId: string): Promise<UserRole | null> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error) {
      // Se não encontrou, o usuário não tem permissão ainda
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Erro ao buscar role:", error);
      return null;
    }

    return data?.role as UserRole;
  } catch (error) {
    console.error("Erro ao buscar role do usuário:", error);
    return null;
  }
}

// Buscar todos os usuários com permissões (apenas para admins)
export async function getAllUserPermissions(): Promise<UserPermission[]> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar permissões:", error);
      return [];
    }

    return data as UserPermission[];
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return [];
  }
}

// Adicionar permissão para um usuário
export async function addUserPermission(
  userId: string,
  email: string,
  fullName: string | null,
  avatarUrl: string | null,
  role: UserRole,
  createdBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("user_roles").insert({
      user_id: userId,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      role,
      created_by: createdBy,
    });

    if (error) {
      console.error("Erro ao adicionar permissão:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar permissão:", error);
    return { success: false, error: "Erro desconhecido" };
  }
}

// Atualizar a role de um usuário
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao atualizar role:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar role:", error);
    return { success: false, error: "Erro desconhecido" };
  }
}

// Remover permissão de um usuário
export async function removeUserPermission(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao remover permissão:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao remover permissão:", error);
    return { success: false, error: "Erro desconhecido" };
  }
}

// Verificar se o usuário é admin
export function isAdmin(role: UserRole | null): boolean {
  return role === "admin";
}

// Verificar se o usuário tem acesso (admin ou editor)
export function hasAccess(role: UserRole | null): boolean {
  return role === "admin" || role === "editor";
}
