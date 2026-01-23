"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "@/svg";
import { ConfirmModalProps } from "./types";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "info",
  loading = false,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Fechar com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, loading]);

  // Fechar ao clicar fora
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "bg-red-600",
          button: "bg-red-600 hover:bg-red-500",
          border: "border-red-900/30",
        };
      case "warning":
        return {
          icon: "bg-yellow-600",
          button: "bg-yellow-600 hover:bg-yellow-500",
          border: "border-yellow-900/30",
        };
      default:
        return {
          icon: "bg-blue-600",
          button: "bg-blue-600 hover:bg-blue-500",
          border: "border-blue-900/30",
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
        className={`bg-gray-900 border ${styles.border} rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`cursor-pointer px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${styles.button}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processando...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
