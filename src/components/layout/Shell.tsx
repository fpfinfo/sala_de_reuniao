import React, { ReactNode } from 'react';

interface ShellProps {
  children: ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F1F3F6] flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      
      {/* Rodapé Corporativo */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <p className="font-medium text-slate-700">
          Tribunal de Justiça do Estado do Pará — Secretaria de Planejamento, Coordenação e Finanças (SEPLAN)
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Sistema Integrado de Gestão e Agendamento de Salas de Reuniões • Conexão Inforge
        </p>
      </footer>
    </div>
  );
};
