"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  DashboardIcon,
  SharePointIcon,
  ClickUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  LogoutIcon,
  EditIcon,
} from "@/svg";
import { automationDefinitions } from "@/lib/automations";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarProps } from "./types";


export default function Sidebar({ className = "" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isLocalhost } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // Dados do usuário
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";
  const userEmail = user?.email || "";
  const userAvatar = user?.user_metadata?.avatar_url || "";

  const getAutomationIcon = (id: string) => {
    if (id === "sharepoint") {
      return <SharePointIcon className="w-5 h-5" />;
    }
    return <ClickUpIcon className="w-5 h-5" />;
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } h-screen bg-gray-950 border-r border-red-900/30 flex flex-col transition-all duration-300 ease-in-out relative ${className}`}
    >
      {/* Toggle Button - Positioned in the middle of the sidebar edge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-50 cursor-pointer w-6 h-6 bg-gray-900 border border-red-900/30 rounded-full flex items-center justify-center hover:bg-red-950 transition-colors text-gray-400 hover:text-white"
        aria-label={isOpen ? "Fechar sidebar" : "Abrir sidebar"}
      >
        {isOpen ? (
          <ChevronLeftIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
      </button>

      {/* Logo Section */}
      <div className="flex items-center justify-center p-4 border-b border-red-900/30">
        {isOpen ? (
          <Image
            src="/logo - Copia.png"
            alt="Logo J&A"
            width={150}
            height={40}
            className="object-contain"
          />
        ) : (
          <Image
            src="/logo-2.png"
            alt="Logo J&A"
            width={28}
            height={48}
            className="object-contain"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
            isActive("/dashboard")
              ? "bg-red-600 text-white"
              : "text-gray-400 hover:bg-red-950/50 hover:text-white"
          }`}
        >
          <DashboardIcon className="w-5 h-5 shrink-0" />
          {isOpen && (
            <span className="font-medium whitespace-nowrap">Dashboard</span>
          )}
        </Link>

        {/* Separator */}
        <div className="pt-4 pb-2">
          {isOpen && (
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
              Automações
            </span>
          )}
          {!isOpen && <div className="border-t border-red-900/30" />}
        </div>

        {/* Automation Links */}
        {automationDefinitions.map((automation) => (
          <Link
            key={automation.id}
            href={`/automacao/${automation.id}`}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
              isActive(`/automacao/${automation.id}`)
                ? "bg-red-600 text-white"
                : "text-gray-400 hover:bg-red-950/50 hover:text-white"
            }`}
            title={!isOpen ? automation.title : undefined}
          >
            <div className="shrink-0">
              {getAutomationIcon(automation.id)}
            </div>
            {isOpen && (
              <span className="font-medium whitespace-nowrap truncate">
                {automation.title}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-red-900/30 relative" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`cursor-pointer w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-950/50 transition-colors ${
            isOpen ? "justify-start" : "justify-center"
          }`}
        >
          {/* Avatar */}
          <div className="shrink-0">
            {userAvatar ? (
              <Image
                src={userAvatar}
                alt={userName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          {isOpen && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-400 truncate">{userEmail}</p>
            </div>
          )}
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div
            className={`absolute bottom-full mb-2 bg-gray-900 border border-red-900/30 rounded-lg shadow-lg overflow-hidden z-50 ${
              isOpen ? "left-4 right-4" : "left-1/2 -translate-x-1/2 w-48"
            }`}
          >
            <Link
              href="/perfil"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-950/50 hover:text-white transition-colors"
            >
              <EditIcon className="w-4 h-4" />
              <span className="text-sm">Editar Perfil</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-950/50 hover:text-white transition-colors border-t border-red-900/30"
            >
              <LogoutIcon className="w-4 h-4" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
