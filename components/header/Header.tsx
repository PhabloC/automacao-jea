"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Erro ao sair:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Obter informações do usuário
  const userPhoto =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Usuário";
  const userEmail = user?.email;

  return (
    <header className="bg-black border-b border-red-950 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img src="/logo.png" alt="Logo" className="w-40 h-10" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Painel de Automações
              </h1>
              <p className="text-sm text-gray-400">
                Gerenciamento de automações com n8n
              </p>
            </div>
          </div>

          {/* User Info Section */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-900/50 border border-red-900/30 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer"
              >
                {/* User Photo */}
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userName}
                    className="w-10 h-10 rounded-full border-2 border-red-800/50"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-900/50 border-2 border-red-800/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* User Name */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white truncate max-w-[150px]">
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">
                      {userEmail}
                    </p>
                  )}
                </div>

                {/* Dropdown Arrow */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-red-900/30 rounded-xl shadow-xl shadow-black/50 z-20 overflow-hidden">
                    {/* User Info in Dropdown */}
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-medium text-white truncate">
                        {userName}
                      </p>
                      {userEmail && (
                        <p className="text-xs text-gray-400 truncate">
                          {userEmail}
                        </p>
                      )}
                    </div>

                    {/* Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left text-gray-300 hover:bg-red-950/50 hover:text-white transition-colors duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      {isSigningOut ? (
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
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
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      )}
                      <span>{isSigningOut ? "Saindo..." : "Sair"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
