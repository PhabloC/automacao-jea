"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon, LightningIcon, SpinnerIcon } from "@/svg";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-900/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-800/15 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-950/10 rounded-full blur-[200px]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(220, 38, 38, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220, 38, 38, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-red-500/30 rounded-full animate-float" />
        <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-red-400/40 rounded-full animate-float delay-500" />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-red-600/25 rounded-full animate-float delay-1000" />
        <div className="absolute bottom-48 right-1/4 w-1 h-1 bg-red-300/35 rounded-full animate-float delay-700" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="J&A Logo" 
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
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-linear-to-br from-red-900/50 to-red-950/80 rounded-xl border border-red-800/30">
              <LightningIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Bem-vindo</h2>
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
                <GoogleIcon className="w-5 h-5" />
                <span>Entrar com Google</span>
              </>
            )}
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-xl bg-linear-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </button>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-gray-600">
            Ao continuar, você concorda com nossos{" "}
            <a href="#" className="text-red-400 hover:text-red-300 transition-colors">
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a href="#" className="text-red-400 hover:text-red-300 transition-colors">
              Política de Privacidade
            </a>
          </p>
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
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-red-900/50 to-transparent" />

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-5px);
          }
          75% {
            transform: translateY(-25px) translateX(5px);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
