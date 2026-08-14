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
      const parsed = JSON.parse(raw);
      // Garante que o Master Admin fabio.freitas sempre exista
      if (!parsed.some((u: User) => u.email === 'fabio.freitas@tjpa.jus.br')) {
        parsed.unshift(INITIAL_USERS[0]);
        this.saveUsers(parsed);
      }
      return parsed;
    } catch {
      return INITIAL_USERS;
    }
  },

  /**
   * Salva a lista de usuários no armazenamento
   */
  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(users));
  },

  /**
   * Realiza o cadastro de uma nova conta (Sign Up)
   */
  async signup(
    name: string,
    email: string,
    password?: string,
    department?: string
  ): Promise<{ user: User; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanDept = (department || 'Secretaria de Planejamento (SEPLAN)').trim();

    const isMaster = cleanEmail === 'fabio.freitas@tjpa.jus.br' || cleanEmail.includes('fabio.freitas');
    const users = this.getRegisteredUsers();

    let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      // Se já existe, atualiza os dados e faz o login
      existing.name = cleanName || existing.name;
      existing.department = cleanDept || existing.department;
      this.saveUsers(users);
      return this.login(cleanEmail, password);
    }

    const newUser: User = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      name: cleanName,
      email: cleanEmail,
      role: isMaster ? 'MASTER_ADMIN' : 'USER',
      department: cleanDept,
    };

    users.push(newUser);
    this.saveUsers(users);

    const token = 'jwt-inforge-' + btoa(JSON.stringify(newUser));
    ApiClient.setToken(token);
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(newUser));

    return { user: newUser, token };
  },

  /**
   * Realiza login no sistema (Sign In)
   */
  async login(email: string, _password?: string): Promise<{ user: User; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getRegisteredUsers();
    let matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      // Se for um novo e-mail não cadastrado, cria automaticamente a conta
      const isMaster = cleanEmail === 'fabio.freitas@tjpa.jus.br' || cleanEmail.includes('fabio.freitas');
      const generatedName = cleanEmail
        .split('@')[0]
        .split('.')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      matchedUser = {
        id: 'usr-' + Math.random().toString(36).substr(2, 9),
        name: generatedName || 'Servidor TJPA',
        email: cleanEmail,
        role: isMaster ? 'MASTER_ADMIN' : 'USER',
        department: 'Secretaria de Planejamento (SEPLAN)',
      };
      users.push(matchedUser);
      this.saveUsers(users);
    }

    const token = 'jwt-inforge-' + btoa(JSON.stringify(matchedUser));
    ApiClient.setToken(token);
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(matchedUser));

    return {
      user: matchedUser,
      token,
    };
  },

  /**
   * Cadastra um novo servidor pela interface de administração
   */
  addUser(newUser: Omit<User, 'id'>): User {
    const currentUser = this.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MASTER_ADMIN';
    if (!isAdmin) {
      throw new Error('Apenas administradores podem cadastrar servidores.');
    }

    const users = this.getRegisteredUsers();
    if (users.some((u) => u.email.toLowerCase() === newUser.email.toLowerCase())) {
      throw new Error('Já existe um servidor cadastrado com este e-mail.');
    }

    const created: User = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      ...newUser,
    };

    users.push(created);
    this.saveUsers(users);
    return created;
  },

  /**
   * Exclui um servidor
   */
  deleteUser(userId: string): void {
    const currentUser = this.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MASTER_ADMIN';
    if (!isAdmin) {
      throw new Error('Apenas administradores podem remover servidores.');
    }

    const users = this.getRegisteredUsers();
    const target = users.find((u) => u.id === userId);
    if (target?.email === 'fabio.freitas@tjpa.jus.br') {
      throw new Error('O Administrador Master não pode ser excluído.');
    }

    const filtered = users.filter((u) => u.id !== userId);
    this.saveUsers(filtered);
  },

  /**
   * Promove ou altera o perfil de um usuário
   */
  updateUserRole(userId: string, newRole: UserRole): void {
    const currentUser = this.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MASTER_ADMIN';
    if (!isAdmin) {
      throw new Error('Apenas administradores podem alterar privilégios de usuários.');
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
   * Obtém o usuário atualmente autenticado
   */
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Troca de usuário logado (atalho de teste)
   */
  switchUser(user: User): void {
    const token = 'jwt-inforge-' + btoa(JSON.stringify(user));
    ApiClient.setToken(token);
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
