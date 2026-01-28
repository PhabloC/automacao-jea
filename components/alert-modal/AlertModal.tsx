"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/svg";
import { AlertModalProps } from "./types";

export type AlertModalType = "success" | "error" | "warning" | "confirm";

export default function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "confirm",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  showCancel = true,
}: AlertModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Focar no botão de confirmação quando o modal abrir
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevenir scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  // Cores baseadas no tipo
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          border: "border-green-900/50",
          bg: "bg-green-950/30",
          iconBg: "bg-green-900/20",
          iconColor: "text-green-400",
          button: "bg-green-900 hover:bg-green-800",
        };
      case "error":
        return {
          border: "border-red-900/50",
          bg: "bg-red-950/30",
          iconBg: "bg-red-900/20",
          iconColor: "text-red-400",
          button: "bg-red-900 hover:bg-red-800",
        };
      case "warning":
        return {
          border: "border-yellow-900/50",
          bg: "bg-yellow-950/30",
          iconBg: "bg-yellow-900/20",
          iconColor: "text-yellow-400",
          button: "bg-yellow-900 hover:bg-yellow-800",
        };
      default: // confirm
        return {
          border: "border-red-900/50",
          bg: "bg-red-950/30",
          iconBg: "bg-red-900/20",
          iconColor: "text-red-400",
          button: "bg-red-900 hover:bg-red-800",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-md mx-4 bg-gray-900 rounded-xl shadow-2xl border ${styles.border} ${styles.bg} p-6 animate-in fade-in zoom-in duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          aria-label="Fechar modal"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Ícone do tipo */}
        <div
          className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}
        >
          {type === "success" && (
            <svg
              className={`w-6 h-6 ${styles.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {type === "error" && (
            <svg
              className={`w-6 h-6 ${styles.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
          {type === "warning" && (
            <svg
              className={`w-6 h-6 ${styles.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}
          {type === "confirm" && (
            <svg
              className={`w-6 h-6 ${styles.iconColor}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* Título */}
        <h3 className="text-xl font-semibold text-white mb-2 pr-8">{title}</h3>

        {/* Mensagem */}
        <p className="text-gray-300 mb-6 whitespace-pre-line">{message}</p>

        {/* Botões */}
        <div className="flex gap-3 justify-end">
          {showCancel && (
            <button
              onClick={onClose}
              className="cursor-pointer px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              {cancelText}
            </button>
          )}
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            className={`cursor-pointer px-4 py-2 ${styles.button} text-white rounded-lg transition-colors font-medium`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
