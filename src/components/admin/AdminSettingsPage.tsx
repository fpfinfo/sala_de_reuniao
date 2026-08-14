import React, { useState, useEffect } from 'react';
import { User, Room, UserRole } from '../../types';
import { authService } from '../../services/authService';
import { roomsService } from '../../services/roomsService';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import {
  Users,
  Shield,
  ShieldAlert,
  User as UserIcon,
  Crown,
  Search,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  Building2,
  Users as UsersIcon,
} from 'lucide-react';

interface AdminSettingsPageProps {
  rooms: Room[];
  onRoomsUpdated: () => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  rooms,
  onRoomsUpdated,
}) => {
  const { addToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'rooms'>('users');

  // Estado de Usuários
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('USER');

  // Estado de Edição de Salas
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState('');
  const [editingRoomCapacity, setEditingRoomCapacity] = useState<number>(10);
  const [editingRoomLocation, setEditingRoomLocation] = useState('');
  const [editingRoomDescription, setEditingRoomDescription] = useState('');
  const [editingRoomColor, setEditingRoomColor] = useState('');

  const loadUsers = () => {
    setUsers(authService.getRegisteredUsers());
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
        message: `${user.name} agora possui perfil de ${
          newRole === 'ADMIN' ? 'Administrador' : 'Usuário Padrão'
        }.`,
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

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      addToast({
        type: 'error',
        title: 'Campos obrigatórios',
        message: 'Preencha o nome e o e-mail do servidor.',
      });
      return;
    }

    try {
      authService.addUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        department: newUserDept.trim() || 'SEPLAN',
        role: newUserRole,
      });

      addToast({
        type: 'success',
        title: 'Servidor cadastrado com sucesso!',
        message: `${newUserName} já pode acessar o sistema de salas.`,
      });

      setNewUserName('');
      setNewUserEmail('');
      setNewUserDept('');
      setIsAddUserModalOpen(false);
      loadUsers();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao cadastrar',
        message: err.message,
      });
    }
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Tem certeza que deseja remover o servidor "${user.name}"?`)) {
      try {
        authService.deleteUser(user.id);
        addToast({
          type: 'success',
          title: 'Servidor removido',
          message: 'O cadastro foi excluído do sistema.',
        });
        loadUsers();
      } catch (err: any) {
        addToast({
          type: 'error',
          title: 'Erro ao excluir',
          message: err.message,
        });
      }
    }
  };

  const startEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
    setEditingRoomCapacity(room.capacity);
    setEditingRoomLocation(room.location);
    setEditingRoomDescription(room.description);
    setEditingRoomColor(room.color);
  };

  const handleSaveRoom = async (roomId: string) => {
    try {
      await roomsService.updateRoom(roomId, {
        name: editingRoomName.trim(),
        capacity: Number(editingRoomCapacity),
        location: editingRoomLocation.trim(),
        description: editingRoomDescription.trim(),
        color: editingRoomColor,
      });

      addToast({
        type: 'success',
        title: 'Sala atualizada com sucesso!',
        message: `As configurações da sala foram salvas.`,
      });

      setEditingRoomId(null);
      onRoomsUpdated();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro ao salvar sala',
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
    <div className="flex flex-col gap-6">
      {/* Cabeçalho da Página de Configurações */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900 border border-amber-300 shadow-sm flex-shrink-0">
            <Crown className="w-6 h-6 text-[#C59B27]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-tjpa-navy uppercase tracking-tight">
                Painel de Configurações Master
              </h2>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                Gabinete SEPLAN
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão de privilégios de servidores, delegação de administradores e parametrização das 3 salas da SEPLAN.
            </p>
          </div>
        </div>

        {/* Navegação entre Sub-Abas */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'users'
                ? 'bg-[#002B5C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestão de Usuários & Perfis</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'rooms'
                ? 'bg-[#002B5C] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Configuração das Salas</span>
          </button>
        </div>
      </div>

      {/* SUB-ABA 1: GESTÃO DE USUÁRIOS */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar servidor por nome, e-mail ou lotação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#002B5C]"
              />
            </div>

            <Button
              variant="gold"
              size="md"
              onClick={() => setIsAddUserModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="font-bold shadow-sm"
            >
              Adicionar Novo Servidor
            </Button>
          </div>

          {/* Tabela de Usuários */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F3F6] border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Servidor</th>
                    <th className="p-3.5">E-mail Institucional</th>
                    <th className="p-3.5">Lotação / Setor</th>
                    <th className="p-3.5">Perfil de Acesso</th>
                    <th className="p-3.5 text-right">Ações de Gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const isMaster =
                      user.role === 'MASTER_ADMIN' || user.email === 'fabio.freitas@tjpa.jus.br';
                    const isAdmin = user.role === 'ADMIN';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isMaster
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isAdmin
                                ? 'bg-blue-100 text-[#002B5C]'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isMaster ? (
                              <Crown className="w-3.5 h-3.5 text-[#C59B27]" />
                            ) : (
                              <UserIcon className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span>{user.name}</span>
                        </td>
                        <td className="p-3.5 text-slate-600 font-medium">{user.email}</td>
                        <td className="p-3.5 text-slate-500 font-medium">{user.department || 'SEPLAN'}</td>
                        <td className="p-3.5">
                          {isMaster ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-300">
                              MASTER ADMIN
                            </span>
                          ) : isAdmin ? (
                            <span className="bg-blue-50 text-[#002B5C] text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
                              ADMINISTRADOR
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                              USUÁRIO PADRÃO
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {!isMaster ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant={isAdmin ? 'outline' : 'secondary'}
                                size="sm"
                                onClick={() => handleToggleRole(user)}
                                className="text-xs font-semibold"
                                leftIcon={
                                  isAdmin ? (
                                    <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                                  ) : (
                                    <Shield className="w-3.5 h-3.5 text-[#002B5C]" />
                                  )
                                }
                              >
                                {isAdmin ? 'Rebaixar a Usuário' : 'Tornar Admin'}
                              </Button>

                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 text-slate-400 hover:text-tjpa-red hover:bg-red-50 rounded transition-colors"
                                title="Remover Servidor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-[#C59B27] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Titular Máximo
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-ABA 2: CONFIGURAÇÃO DAS SALAS */}
      {activeSubTab === 'rooms' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isEditing = editingRoomId === room.id;

            return (
              <div
                key={room.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between transition-all"
                style={{
                  borderTopWidth: '6px',
                  borderTopColor: isEditing ? editingRoomColor : room.color,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: isEditing ? editingRoomColor : room.color }}
                    />
                    {!isEditing ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditRoom(room)}
                        leftIcon={<Edit className="w-3.5 h-3.5" />}
                        className="text-xs font-semibold text-[#002B5C]"
                      >
                        Editar
                      </Button>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Modo Edição
                      </span>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="flex flex-col gap-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{room.name}</h4>
                        <span className="text-xs text-slate-500 font-medium">{room.location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <UsersIcon className="w-4 h-4 text-[#002B5C]" />
                        <span>Capacidade: {room.capacity} pessoas</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{room.description}</p>

                      {room.equipment && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                          {room.equipment.map((eq, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Input
                        label="Nome da Sala"
                        value={editingRoomName}
                        onChange={(e) => setEditingRoomName(e.target.value)}
                        required
                      />

                      <Input
                        label="Capacidade de Pessoas (Lugares)"
                        type="number"
                        min={1}
                        max={100}
                        value={editingRoomCapacity}
                        onChange={(e) => setEditingRoomCapacity(Number(e.target.value))}
                        required
                      />

                      <Input
                        label="Localização Física"
                        value={editingRoomLocation}
                        onChange={(e) => setEditingRoomLocation(e.target.value)}
                        required
                      />

                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          Descrição / Finalidade
                        </label>
                        <textarea
                          rows={3}
                          value={editingRoomDescription}
                          onChange={(e) => setEditingRoomDescription(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#002B5C]/20 focus:border-[#002B5C]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingRoomId(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSaveRoom(room.id)}
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                      className="bg-[#002B5C] font-bold"
                    >
                      Salvar Alterações
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Adicionar Novo Servidor */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Cadastrar Novo Servidor"
        subtitle="Adicione um servidor do TJPA para agendamento de salas"
        maxWidth="md"
      >
        <form onSubmit={handleAddUser} className="flex flex-col gap-4">
          <Input
            label="Nome Completo do Servidor *"
            placeholder="Ex: João da Silva"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="E-mail Institucional *"
            type="email"
            placeholder="servidor@tjpa.jus.br"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            required
          />

          <Input
            label="Lotação / Coordenadoria"
            placeholder="Ex: COFIN, CODAR, Gabinete"
            value={newUserDept}
            onChange={(e) => setNewUserDept(e.target.value)}
          />

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Perfil Inicial de Acesso
            </label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-[#002B5C]/20 focus:border-[#002B5C]"
            >
              <option value="USER">Usuário Padrão (Agendamentos Pendentes)</option>
              <option value="ADMIN">Administrador (Aprova e Agenda com Prioridade)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddUserModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="bg-[#002B5C] font-bold">
              Cadastrar Servidor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
