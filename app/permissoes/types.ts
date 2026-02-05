export interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  provider: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: "admin" | "editor" | null;
  has_permission: boolean;
}

export interface ModalState {
  isOpen: boolean;
  type: "delete" | "grant_editor" | "grant_admin" | null;
  user: UserData | null;
}
