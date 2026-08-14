import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Building2, Lock, Mail, ShieldCheck } from 'lucide-react';
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
        message: 'Bem-vindo ao Sistema de Gestão de Salas da SEPLAN.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Falha de Autenticação',
        message: err.message || 'Credenciais inválidas.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#002B5C] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#001E42] opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#C59B27] opacity-20 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10">
        {/* Cabeçalho do Card */}
        <div className="bg-[#F1F3F6] p-8 text-center border-b border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-[#002B5C] flex items-center justify-center mx-auto mb-4 shadow-md">
            <Building2 className="w-9 h-9 text-[#C59B27]" />
          </div>
          <h2 className="text-xl font-black text-[#002B5C] tracking-tight uppercase">
            Tribunal de Justiça do Pará
          </h2>
          <p className="text-xs font-bold text-[#C59B27] uppercase tracking-wider mt-0.5">
            SEPLAN — Salas de Reunião
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Acesse com sua conta corporativa para gerenciar e reservar salas.
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
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

          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-[#002B5C] focus:ring-[#002B5C]"
              />
              <span>Lembrar meu acesso</span>
            </label>
            <span className="text-[#002B5C] font-semibold hover:underline cursor-pointer">
              Recuperar senha
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-[#002B5C] hover:bg-[#001E42] font-bold text-sm shadow-md mt-2"
          >
            Entrar no Sistema
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Autenticação segura integrada ao Inforge TJPA</span>
          </div>
        </form>
      </div>

      <p className="text-xs text-slate-300 mt-6 font-medium">
        © 2026 Tribunal de Justiça do Estado do Pará • SEPLAN
      </p>
    </div>
  );
};
