import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Calendar, ListChecks, PlusCircle, Building2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  activeTab: 'timeline' | 'my-bookings';
  onTabChange: (tab: 'timeline' | 'my-bookings') => void;
  onNewBookingClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewBookingClick,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      {/* Barra Superior de Usuário (Top Utility Bar) */}
      <div className="bg-[#002B5C] text-white px-4 sm:px-8 py-1.5 text-xs flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-200 font-medium">Tribunal de Justiça do Estado do Pará - SEPLAN</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-200">
            <User className="w-3.5 h-3.5 text-[#C59B27]" />
            <span className="font-medium">{user?.email || 'fabio.freitas@tjpa.jus.br'}</span>
            <span className="bg-[#C59B27] text-white text-[10px] font-bold px-1.5 py-0.2 rounded ml-1">
              {user?.role || 'SEPLAN'}
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            title="Encerrar Sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Cabeçalho Principal Institucional */}
      <div className="px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Brasão Oficial TJPA */}
          <img
            src="https://www.tjpa.jus.br/PortalExterno/hotsite/jurisprudencia/img/logo-oficial-tjpa.png"
            alt="Brasão TJPA"
            className="h-12 w-auto object-contain flex-shrink-0"
            onError={(e) => {
              // Fallback gracioso se a imagem externa falhar
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-lg sm:text-xl font-black text-[#002B5C] tracking-tight uppercase">
              Tribunal de Justiça do Estado do Pará
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              SECRETARIA DE PLANEJAMENTO, COORDENAÇÃO E FINANÇAS — <span className="text-[#C59B27] font-bold">SEPLAN</span>
            </p>
          </div>
        </div>

        {/* Botão de Ação Primária */}
        <div className="flex items-center gap-3">
          <Button
            variant="gold"
            size="md"
            onClick={onNewBookingClick}
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="font-bold shadow-md hover:brightness-105"
          >
            Novo Agendamento
          </Button>
        </div>
      </div>

      {/* Barra de Navegação e Abas */}
      <div className="px-4 sm:px-8 border-t border-slate-100 flex items-center justify-between overflow-x-auto bg-[#F1F3F6]/50">
        <nav className="flex space-x-1 sm:space-x-4">
          <button
            onClick={() => onTabChange('timeline')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'timeline'
                ? 'border-[#002B5C] text-[#002B5C] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Grade das Salas (Painel Diário)</span>
          </button>

          <button
            onClick={() => onTabChange('my-bookings')}
            className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'my-bookings'
                ? 'border-[#002B5C] text-[#002B5C] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Meus Agendamentos</span>
          </button>
        </nav>

        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 pr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#002B5C]"></span> Sala 1
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669] ml-2"></span> Sala 2
          <span className="w-2.5 h-2.5 rounded-full bg-[#C59B27] ml-2"></span> Sala 3
        </div>
      </div>
    </header>
  );
};
