"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  SharePointIcon,
  ClickUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/svg";
import { automationDefinitions } from "@/lib/automations";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

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
      } h-screen bg-gray-950 border-r border-red-900/30 flex flex-col transition-all duration-300 ease-in-out ${className}`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-red-900/30">
        <div className="flex items-center justify-center flex-1">
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
              width={40}
              height={40}
              className="object-contain"
            />
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-red-950/50 transition-colors text-gray-400 hover:text-white"
          aria-label={isOpen ? "Fechar sidebar" : "Abrir sidebar"}
        >
          {isOpen ? (
            <ChevronLeftIcon className="w-5 h-5" />
          ) : (
            <ChevronRightIcon className="w-5 h-5" />
          )}
        </button>
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

      {/* Footer */}
      <div className="p-4 border-t border-red-900/30">
        {isOpen ? (
          <p className="text-xs text-gray-500 text-center">
            Painel de Automações v1.0
          </p>
        ) : (
          <p className="text-xs text-gray-500 text-center">v1.0</p>
        )}
      </div>
    </aside>
  );
}
