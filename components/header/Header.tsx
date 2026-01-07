import { LightningIcon } from "@/svg";

export default function Header() {
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
        </div>
      </div>
    </header>
  );
}
