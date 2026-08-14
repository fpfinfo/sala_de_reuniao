import { User, UserRole } from '../types';
import { ApiClient } from './api';

const MOCK_USER_STORAGE_KEY = 'seplan_salas_current_user';
const USERS_LIST_STORAGE_KEY = 'seplan_salas_registered_users';

// Usuários iniciais do sistema SEPLAN
const INITIAL_USERS: User[] = [
  {
    id: 'usr-seplan-001',
    name: 'Fabio Freitas',
    email: 'fabio.freitas@tjpa.jus.br',
    role: 'MASTER_ADMIN',
    department: 'Gabinete da Secretaria (SEPLAN)',
  },
  {
    id: 'usr-seplan-002',
    name: 'Coordenadoria de Planejamento',
    email: 'planejamento@tjpa.jus.br',
    role: 'ADMIN',
    department: 'SEPLAN / Planejamento',
  },
  {
    id: 'usr-seplan-003',
    name: 'Servidor Finanças',
    email: 'servidor.financas@tjpa.jus.br',
    role: 'USER',
    department: 'COFIN / Coordenação Financeira',
  },
  {
    id: 'usr-seplan-004',
    name: 'Servidor Arrecadação',
    email: 'servidor.arrecadacao@tjpa.jus.br',
    role: 'USER',
    department: 'CODAR / Arrecadação',
  },
];

export const authService = {
  /**
   * Obtém a lista de usuários registrados
   */
  getRegisteredUsers(): User[] {
    const raw = localStorage.getItem(USERS_LIST_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS;
    }
  },

  /**
   * Atualiza a lista de usuários no armazenamento
   */
  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(users));
  },

  /**
   * Promove ou altera o perfil de um usuário (Exclusivo para MASTER_ADMIN)
   */
  updateUserRole(userId: string, newRole: UserRole): void {
    const currentUser = this.getCurrentUser();
    if (currentUser?.role !== 'MASTER_ADMIN') {
      throw new Error('Apenas o Administrador Master pode alterar privilégios de usuários.');
    }

    const users = this.getRegisteredUsers();
    const updated = users.map((u) => {
      if (u.id === userId && u.email !== 'fabio.freitas@tjpa.jus.br') {
        return { ...u, role: newRole };
      }
      return u;
    });

    this.saveUsers(updated);
  },

  /**
   * Realiza login no Inforge
   */
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    try {
      const response = await ApiClient.request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      ApiClient.setToken(response.token);
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(response.user));
      return response;
    } catch (error) {
      // Procura usuário registrado
      const users = this.getRegisteredUsers();
      let matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!matchedUser) {
        // Cria usuário novo
        const isMaster = email.toLowerCase().includes('fabio.freitas');
        matchedUser = {
          id: 'usr-' + Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email: email,
          role: isMaster ? 'MASTER_ADMIN' : 'USER',
          department: 'Secretaria de Planejamento (SEPLAN)',
        };
        users.push(matchedUser);
        this.saveUsers(users);
      }

      const mockToken = 'jwt-mock-inforge-' + btoa(JSON.stringify(matchedUser));
      ApiClient.setToken(mockToken);
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(matchedUser));

      return {
        user: matchedUser,
        token: mockToken,
      };
    }
  },

  /**
   * Obtém o usuário atualmente autenticado
   */
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (!raw) return INITIAL_USERS[0];
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_USERS[0];
    }
  },

  /**
   * Troca de usuário logado (atalho de desenvolvimento/demo)
   */
  switchUser(user: User): void {
    const mockToken = 'jwt-mock-inforge-' + btoa(JSON.stringify(user));
    ApiClient.setToken(mockToken);
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
    window.location.reload();
  },

  /**
   * Realiza logout
   */
  logout(): void {
    ApiClient.clearToken();
    localStorage.removeItem(MOCK_USER_STORAGE_KEY);
    window.location.reload();
  },
};
