"use client";

import React from "react";
import { TabsProps } from "./types";

export default function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab || tabs[0]?.id);

  if (!tabs.length) return null;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-red-900/30 mb-6">
        <nav className="flex space-x-1" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-6 py-3 text-sm font-medium rounded-t-lg transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "text-red-400 bg-red-950/30"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-900/50"
                }
              `}
            >
              <div className="flex items-center gap-2">
                {tab.icon && (
                  <span
                    className={`
                      flex items-center justify-center
                      ${
                        activeTab === tab.id
                          ? "text-red-400"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-black to-red-950 rounded-full"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
