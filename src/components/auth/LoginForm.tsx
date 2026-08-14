import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, ShieldCheck, User as UserIcon, Building2, UserPlus, LogIn } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const LoginForm: React.FC = () => {
  const { login, signup, isLoading } = useAuth();
  const { addToast } = useToast();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Estado de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estado de Cadastro (Sign Up)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupDept, setSignupDept] = useState('Secretaria de Planejamento (SEPLAN)');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupName.trim()) {
      addToast({
        type: 'error',
        title: 'Nome obrigatório',
        message: 'Por favor, informe seu nome completo.',
      });
      return;
    }

    if (!signupEmail || !signupEmail.includes('@')) {
      addToast({
        type: 'error',
        title: 'E-mail inválido',
        message: 'Por favor, insira um e-mail corporativo válido.',
      });
      return;
    }

    if (signupPassword && signupConfirmPassword && signupPassword !== signupConfirmPassword) {
      addToast({
        type: 'error',
        title: 'Senhas não conferem',
        message: 'A confirmação de senha deve ser igual à senha digitada.',
      });
      return;
    }

    try {
      await signup(signupName, signupEmail, signupPassword, signupDept);
      addToast({
        type: 'success',
        title: 'Conta Criada com Sucesso!',
        message: `Bem-vindo(a), ${signupName}! Você já pode solicitar salas.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao criar conta',
        message: err.message || 'Não foi possível cadastrar o usuário.',
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

        {/* Alternador de Abas (Sign In / Sign Up) */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setAuthMode('signin')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              authMode === 'signin'
                ? 'border-[#002B5C] text-[#002B5C] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar (Sign In)</span>
          </button>
          <button
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
              authMode === 'signup'
                ? 'border-[#002B5C] text-[#002B5C] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Criar Conta (Sign Up)</span>
          </button>
        </div>

        {/* FORMULÁRIO 1: SIGN IN (ENTRAR) */}
        {authMode === 'signin' && (
          <form onSubmit={handleLoginSubmit} className="p-6 flex flex-col gap-4">
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
              placeholder="Sua senha de acesso"
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
              Acessar Sistema
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-3 border-t border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Autenticação segura — SEPLAN / TJPA</span>
            </div>
          </form>
        )}

        {/* FORMULÁRIO 2: SIGN UP (CADASTRAR NOVO USUÁRIO) */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="p-6 flex flex-col gap-3.5">
            <Input
              label="Nome Completo *"
              placeholder="Ex: Ana Paula Souza"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4" />}
              required
              autoFocus
            />

            <Input
              label="E-mail Institucional *"
              type="email"
              placeholder="ana.souza@tjpa.jus.br"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Lotação / Setor"
              placeholder="Ex: COFIN, CODAR, Gabinete SEPLAN"
              value={signupDept}
              onChange={(e) => setSignupDept(e.target.value)}
              leftIcon={<Building2 className="w-4 h-4" />}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Senha *"
                type="password"
                placeholder="Criar senha"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirmar Senha *"
                type="password"
                placeholder="Repita a senha"
                value={signupConfirmPassword}
                onChange={(e) => setSignupConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold text-sm shadow-md mt-2"
            >
              Criar Conta e Entrar
            </Button>

            <p className="text-[11px] text-center text-slate-500 pt-2">
              Já possui cadastro?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="text-[#002B5C] font-bold hover:underline"
              >
                Fazer Login
              </button>
            </p>
          </form>
        )}
      </div>

      <p className="text-xs text-slate-300 mt-4 font-medium">
        © 2026 Tribunal de Justiça do Estado do Pará • SEPLAN
      </p>
    </div>
  );
};
