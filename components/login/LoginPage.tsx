"use client";

import { useState } from "react";
import Image from "next/image";
import { GoogleIcon, SpinnerIcon } from "@/svg";
import { useAuth } from "@/contexts/AuthContext";
import NeuralBackground from "@/components/neural-background/NeuralBackground";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Neural Vortex Background */}
      <NeuralBackground />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="J&A Logo"
              width={140}
              height={56}
              className="h-14 w-auto drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Painel de Automações
          </h1>
          <p className="text-gray-400 text-sm">
            Faça login para acessar suas automações
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-linear-to-b from-gray-900/80 to-gray-950/90 backdrop-blur-xl rounded-2xl border border-red-900/30 shadow-2xl shadow-red-950/20 p-8">
          {/* Card Header */}
          <div className="flex items-center  gap-3 mb-8">
            <div className="text-center w-full">
              <h2 className="text-2xl font-semibold text-white">Bem-vindo</h2>
              <p className="text-xs text-gray-500">Acesse sua conta</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-950/50 border border-red-900/50 rounded-lg">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}

          {/* Divider with text */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-gray-900 text-gray-500 uppercase tracking-wider">
                Continue com
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="cursor-pointer group relative w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-950/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="w-5 h-5 animate-spin text-gray-600" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <span className="animate-google-icon">
                  <GoogleIcon className="w-5 h-5" />
                </span>
                <span>Entrar com Google</span>
              </>
            )}

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-xl bg-linear-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </button>

          {/* Terms */}
          {/*  <p className="mt-6 text-center text-xs text-gray-600">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-red-400 hover:text-red-300 transition-colors">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="text-red-400 hover:text-red-300 transition-colors">
              Política de Privacidade
            </a>
          </p> */}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">
            Integração segura com{" "}
            <span className="text-red-400 font-medium">Supabase Auth</span>
          </p>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-red-900/50 to-transparent z-10" />

      {/* Custom animations */}
      <style jsx>{`
        @keyframes googleIconEntrance {
          0% {
            opacity: 0;
            transform: translateY(20px) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotate(360deg);
          }
        }
        .animate-google-icon {
          display: inline-flex;
          animation: googleIconEntrance 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
