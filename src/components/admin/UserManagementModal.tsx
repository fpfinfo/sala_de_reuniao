import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { Shield, ShieldAlert, User as UserIcon, CheckCircle2, Crown, Search } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = () => {
    setUsers(authService.getRegisteredUsers());
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const handleToggleRole = (user: User) => {
    if (user.email === 'fabio.freitas@tjpa.jus.br') {
      addToast({
        type: 'warning',
        title: 'Operação não permitida',
        message: 'O perfil do Administrador Master não pode ser alterado.',
      });
      return;
    }

    const newRole: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      authService.updateUserRole(user.id, newRole);
      addToast({
        type: 'success',
        title: 'Perfil atualizado!',
        message: `${user.name} agora possui perfil de ${newRole === 'ADMIN' ? 'Administrador' : 'Usuário Padrão'}.`,
      });
      loadUsers();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao alterar perfil',
        message: err.message,
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestão de Usuários e Administradores"
      subtitle="Controle de privilégios e delegação de administradores (Gabinete Master)"
      maxWidth="xl"
    >
      <div className="flex flex-col gap-4">
        {/* Barra de Busca */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar servidor por nome, e-mail ou coordenadoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5C]"
          />
        </div>

        {/* Lista de Usuários */}
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto bg-white">
          {filteredUsers.map((user) => {
            const isMaster = user.role === 'MASTER_ADMIN' || user.email === 'fabio.freitas@tjpa.jus.br';
            const isAdmin = user.role === 'ADMIN';

            return (
              <div
                key={user.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      isMaster
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isAdmin
                        ? 'bg-blue-100 text-[#002B5C]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isMaster ? <Crown className="w-4 h-4 text-[#C59B27]" /> : <UserIcon className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{user.name}</span>
                      {isMaster ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                          MASTER ADMIN
                        </span>
                      ) : isAdmin ? (
                        <span className="bg-blue-50 text-[#002B5C] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          ADMINISTRADOR
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                          SERVIDOR
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500">{user.email}</span>
                    {user.department && (
                      <span className="text-[10px] text-slate-400 font-medium">{user.department}</span>
                    )}
                  </div>
                </div>

                {/* Botão de Toggle de Perfil */}
                {!isMaster ? (
                  <Button
                    variant={isAdmin ? 'outline' : 'secondary'}
                    size="sm"
                    onClick={() => handleToggleRole(user)}
                    className="text-xs font-semibold"
                    leftIcon={isAdmin ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5 text-[#002B5C]" />}
                  >
                    {isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                  </Button>
                ) : (
                  <span className="text-[11px] font-bold text-[#C59B27] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Responsável Geral
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <Button variant="primary" onClick={onClose} className="bg-[#002B5C] font-bold">
            Concluir
          </Button>
        </div>
      </div>
    </Modal>
  );
};
