import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, ShieldCheck, Crown, User as UserIcon } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('fabio.freitas@tjpa.jus.br');
  const [password, setPassword] = useState('••••••••');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      addToast({
        type: 'error',
        title: 'E-mail inválido',
        message: 'Por favor, insira um e-mail institucional válido.',
      });
      return;
    }

    try {
      await login(email, password);
      addToast({
        type: 'success',
        title: 'Autenticado com Sucesso',
        message: `Bem-vindo ao Sistema de Salas da SEPLAN.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Falha de Autenticação',
        message: err.message || 'Credenciais inválidas.',
      });
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    login(quickEmail, '123456');
  };

  return (
    <div className="min-h-screen bg-[#002B5C] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#001E42] opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C59B27] opacity-20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10">
        {/* Cabeçalho do Card */}
        <div className="bg-[#F1F3F6] p-6 text-center border-b border-slate-200">
          <img
            src="https://www.tjpa.jus.br/PortalExterno/hotsite/jurisprudencia/img/logo-oficial-tjpa.png"
            alt="Brasão TJPA"
            className="h-16 w-auto object-contain mx-auto mb-3"
          />
          <h2 className="text-lg font-black text-[#002B5C] tracking-tight uppercase">
            Tribunal de Justiça do Pará
          </h2>
          <p className="text-xs font-bold text-[#C59B27] uppercase tracking-wider mt-0.5">
            SEPLAN — Agendamento de Salas
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <Input
            label="E-mail Institucional"
            type="email"
            placeholder="usuario@tjpa.jus.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Senha de Acesso"
            type="password"
            placeholder="Sua senha corporativa"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-[#002B5C] hover:bg-[#001E42] font-bold text-sm shadow-md mt-1"
          >
            Entrar no Sistema
          </Button>

          {/* Acesso Rápido para Demonstração dos Perfis */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wide">
              Acesso Rápido para Testes:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('fabio.freitas@tjpa.jus.br')}
                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-[#C59B27] flex-shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-[11px] font-bold text-amber-950 truncate">Fabio Freitas</span>
                  <span className="text-[9px] text-amber-700 font-semibold">Master Admin</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('servidor.financas@tjpa.jus.br')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-[11px] font-bold text-slate-800 truncate">Servidor Padrão</span>
                  <span className="text-[9px] text-slate-500 font-semibold">Usuário (Pendente)</span>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Autenticação segura integrada ao Inforge TJPA</span>
          </div>
        </form>
      </div>

      <p className="text-xs text-slate-300 mt-4 font-medium">
        © 2026 Tribunal de Justiça do Estado do Pará • SEPLAN
      </p>
    </div>
  );
};
