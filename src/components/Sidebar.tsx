import { type ReactNode } from 'react';
import {
  LayoutDashboard,
  Handshake,
  Headphones,
  DollarSign,
  Settings,
  Megaphone,
  Tv,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export type ModuleKey =
  | 'diretoria'
  | 'comercial'
  | 'atendimento'
  | 'financeiro'
  | 'administracao'
  | 'marketing';

type NavItem = {
  key: ModuleKey;
  label: string;
  icon: ReactNode;
  description: string;
};

const navItems: NavItem[] = [
  { key: 'diretoria', label: 'Diretoria', icon: <LayoutDashboard size={20} />, description: 'Painel principal e assistente IA' },
  { key: 'comercial', label: 'Comercial', icon: <Handshake size={20} />, description: 'Leads, planos e negociações' },
  { key: 'atendimento', label: 'Atendimento', icon: <Headphones size={20} />, description: 'Tickets e suporte ao cliente' },
  { key: 'financeiro', label: 'Financeiro', icon: <DollarSign size={20} />, description: 'Pagamentos e renovações' },
  { key: 'administracao', label: 'Administração', icon: <Settings size={20} />, description: 'Clientes, servidores e apps' },
  { key: 'marketing', label: 'Marketing', icon: <Megaphone size={20} />, description: 'Campanhas e conteúdos' },
];

type SidebarProps = {
  active: ModuleKey;
  onNavigate: (key: ModuleKey) => void;
  mobileOpen: boolean;
  onMobileToggle: () => void;
};

export function Sidebar({ active, onNavigate, mobileOpen, onMobileToggle }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-dark-950/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-dark-900 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-dark-800 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-500/20">
              <Tv size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">PIRAÍ AI</h1>
              <p className="text-xs text-dark-400">Piraí Conect TV</p>
            </div>
          </div>
          <button
            onClick={onMobileToggle}
            className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-dark-500">
            Módulos
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = active === item.key;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => {
                      onNavigate(item.key);
                      if (mobileOpen) onMobileToggle();
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                        : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-dark-400 group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className={`text-xs ${isActive ? 'text-primary-100' : 'text-dark-500'} truncate`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-dark-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-dark-800/50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-primary-500">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white">PIRAÍ AI Online</p>
              <p className="text-xs text-dark-400">Sistema operacional</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse-glow" />
          </div>
        </div>
      </aside>
    </>
  );
}

export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-dark-200 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
          <Tv size={18} className="text-white" />
        </div>
        <span className="font-bold text-dark-900">PIRAÍ AI</span>
      </div>
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-dark-600 hover:bg-dark-100"
      >
        <Menu size={22} />
      </button>
    </div>
  );
}
