"use client";

import { useState, useEffect, useRef } from "react";
import { CloseIcon, TrashIcon, ChevronRightIcon } from "@/svg";
import { Post } from "./types";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (posts: Post[]) => void;
  initialPosts?: Post[];
}

interface PostFormData {
  id: string;
  titulo: string;
  formato: string;
  descricao: string;
  referencia: string;
}


export default function PostModal({
  isOpen,
  onClose,
  onSave,
  initialPosts = [],
}: PostModalProps) {
  const [posts, setPosts] = useState<PostFormData[]>([]);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Inicializar com posts existentes ou criar um novo
  useEffect(() => {
    if (isOpen) {
      if (initialPosts.length > 0) {
        setPosts(initialPosts.map(p => ({ ...p })));
        setOpenPostId(initialPosts[0].id);
      } else {
        const newPost = createEmptyPost();
        setPosts([newPost]);
        setOpenPostId(newPost.id);
      }
    }
  }, [isOpen, initialPosts]);

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const createEmptyPost = (): PostFormData => ({
    id: crypto.randomUUID(),
    titulo: "",
    formato: "",
    descricao: "",
    referencia: "",
  });

  const handleAddPost = () => {
    const newPost = createEmptyPost();
    setPosts([...posts, newPost]);
    setOpenPostId(newPost.id); // Abre o novo post e fecha os outros
  };

  const togglePost = (postId: string) => {
    setOpenPostId(openPostId === postId ? null : postId);
  };

  const handleRemovePost = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (posts.length > 1) {
      const newPosts = posts.filter((p) => p.id !== postId);
      setPosts(newPosts);
      // Se o post removido estava aberto, abrir o primeiro da lista
      if (openPostId === postId && newPosts.length > 0) {
        setOpenPostId(newPosts[0].id);
      }
    }
  };

  const handlePostChange = (
    postId: string,
    field: keyof PostFormData,
    value: string
  ) => {
    setPosts(
      posts.map((p) => (p.id === postId ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = () => {
    // Validar se pelo menos um post está preenchido
    const validPosts = posts.filter(
      (p) => p.titulo.trim() && p.formato.trim()
    );
    
    if (validPosts.length === 0) {
      return;
    }

    onSave(validPosts);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl mx-4 bg-gray-900 rounded-xl shadow-2xl border border-red-900/50 max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-900/30">
          <h2 className="text-xl font-semibold text-white">Adicionar Posts</h2>
          <button
            onClick={onClose}
            className="cursor-pointer p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            aria-label="Fechar modal"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {posts.map((post, index) => {
            const isOpen = openPostId === post.id;
            const hasContent = post.titulo || post.formato;
            
            return (
              <div
                key={post.id}
                className="bg-gray-800/50 rounded-lg border border-red-900/20 overflow-hidden"
              >
                {/* Header do Acordeão - Sempre visível */}
                <button
                  type="button"
                  onClick={() => togglePost(post.id)}
                  className="cursor-pointer w-full flex items-center justify-between p-4 hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRightIcon 
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`} 
                    />
                    <div className="text-left">
                      <span className="text-sm font-medium text-red-400">
                        Post {index + 1}
                      </span>
                      {hasContent && !isOpen && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {post.titulo || "Sem título"} 
                          {post.formato && ` • ${post.formato}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {posts.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemovePost(post.id, e)}
                      className="cursor-pointer p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
                      title="Remover post"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </button>

                {/* Conteúdo do Acordeão - Visível apenas quando aberto */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-4 border-t border-red-900/20 pt-4">
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Título *
                      </label>
                      <input
                        type="text"
                        value={post.titulo}
                        onChange={(e) =>
                          handlePostChange(post.id, "titulo", e.target.value)
                        }
                        placeholder="Digite o título do post"
                        className="w-full px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900"
                      />
                    </div>

                    {/* Formato */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Formato *
                      </label>
                      <input
                        type="text"
                        value={post.formato}
                        onChange={(e) =>
                          handlePostChange(post.id, "formato", e.target.value)
                        }
                        placeholder="Ex: Carrossel, Reels, Story, Vídeo..."
                        className="w-full px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900"
                      />
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={post.descricao}
                        onChange={(e) =>
                          handlePostChange(post.id, "descricao", e.target.value)
                        }
                        placeholder="Digite a descrição do post"
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900 resize-none"
                      />
                    </div>

                    {/* Referência */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Referência
                      </label>
                      <input
                        type="text"
                        value={post.referencia}
                        onChange={(e) =>
                          handlePostChange(post.id, "referencia", e.target.value)
                        }
                        placeholder="Link ou referência do post"
                        className="w-full px-4 py-3 rounded-lg border bg-gray-800 text-white border-red-900/50 focus:ring-2 focus:ring-red-900 focus:border-red-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className=" flex items-center justify-between p-6 border-t border-red-900/30">
          <button
            type="button"
            onClick={handleAddPost}
            className=" cursor-pointer px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Adicionar Post
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!posts.some((p) => p.titulo.trim() && p.formato.trim())}
              className={`cursor-pointer px-4 py-2 rounded-lg transition-colors font-medium ${
                posts.some((p) => p.titulo.trim() && p.formato.trim())
                  ? "bg-red-900 hover:bg-red-800 text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Salvar Posts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
