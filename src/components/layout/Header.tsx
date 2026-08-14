import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Calendar, ListChecks, PlusCircle, ShieldCheck, Settings, Crown, ArrowLeftRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { authService } from '../../services/authService';

interface HeaderProps {
  activeTab: 'timeline' | 'my-bookings' | 'pending-approvals' | 'settings';
  onTabChange: (tab: 'timeline' | 'my-bookings' | 'pending-approvals' | 'settings') => void;
  onNewBookingClick: () => void;
  pendingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewBookingClick,
  pendingCount,
}) => {
  const { user, logout } = useAuth();
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  const isMaster = user?.role === 'MASTER_ADMIN' || user?.email === 'fabio.freitas@tjpa.jus.br';
  const isAdmin = isMaster || user?.role === 'ADMIN';

  const allRegisteredUsers = authService.getRegisteredUsers();

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      {/* Barra Superior de Usuário (Top Utility Bar) */}
      <div className="bg-[#002B5C] text-white px-4 sm:px-8 py-1.5 text-xs flex justify-between items-center relative">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-200 font-medium hidden sm:inline">
            Tribunal de Justiça do Estado do Pará - SEPLAN
          </span>
          <span className="text-slate-200 font-medium sm:hidden">TJPA - SEPLAN</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Alternador Rápido de Perfil (Demo & Testes) */}
          <div className="relative">
            <button
              onClick={() => setShowUserSwitcher(!showUserSwitcher)}
              className="flex items-center gap-1.5 text-slate-200 hover:text-white bg-[#001E42] px-2.5 py-0.5 rounded border border-[#0B3B73] transition-all"
              title="Clique para alternar perfil de teste"
            >
              {isMaster ? (
                <Crown className="w-3.5 h-3.5 text-[#C59B27]" />
              ) : isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="font-semibold text-[11px] truncate max-w-[140px] sm:max-w-none">
                {user?.name || user?.email}
              </span>
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded ml-1 ${
                  isMaster
                    ? 'bg-[#C59B27] text-white'
                    : isAdmin
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-600 text-white'
                }`}
              >
                {isMaster ? 'MASTER ADMIN' : isAdmin ? 'ADMIN' : 'USUÁRIO'}
              </span>
              <ArrowLeftRight className="w-3 h-3 text-slate-400 ml-1" />
            </button>

            {/* Menu Dropdown de Troca de Usuário */}
            {showUserSwitcher && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-fadeIn">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Alternar Perfil para Teste:
                </div>
                {allRegisteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      authService.switchUser(u);
                      setShowUserSwitcher(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 transition-colors ${
                      user?.id === u.id ? 'bg-blue-50 font-bold text-[#002B5C]' : ''
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.email}</div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-slate-200 text-slate-700">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            title="Encerrar Sessão"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Cabeçalho Principal Institucional */}
      <div className="px-4 sm:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="https://www.tjpa.jus.br/PortalExterno/hotsite/jurisprudencia/img/logo-oficial-tjpa.png"
            alt="Brasão TJPA"
            className="h-12 w-auto object-contain flex-shrink-0"
            onError={(e) => {
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

        {/* Ações */}
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

          {/* Aba de Aprovações Pendentes (Admin / Master) */}
          {isAdmin && (
            <button
              onClick={() => onTabChange('pending-approvals')}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === 'pending-approvals'
                  ? 'border-[#002B5C] text-[#002B5C] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Aprovações Pendentes</span>
              {pendingCount > 0 && (
                <span className="bg-tjpa-red text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Aba de Gestão de Usuários e Configurações (Apenas Administradores) */}
          {isAdmin && (
            <button
              onClick={() => onTabChange('settings')}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
                activeTab === 'settings'
                  ? 'border-[#002B5C] text-[#002B5C] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Settings className="w-4 h-4 text-[#C59B27]" />
              <span>Gestão de Usuários & Salas</span>
            </button>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 pr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#002B5C]"></span> Sala 1 (CODAR)
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669] ml-2"></span> Sala 2 (SEPLAN)
          <span className="w-2.5 h-2.5 rounded-full bg-[#C59B27] ml-2"></span> Sala 3 (COFIN)
        </div>
      </div>
    </header>
  );
};
