export interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (posts: Post[]) => void;
  initialPosts?: Post[];
  title?: string;
}

export interface PostFormData {
  id: string;
  titulo: string;
  formato: string;
  canais: string;
  dataPublicacao: string;
  descricao: string;
  referencia: string;
}

export interface Post {
  id: string;
  titulo: string;
  formato: string;
  canais: string;
  dataPublicacao: string;
  descricao: string;
  referencia: string;
}
