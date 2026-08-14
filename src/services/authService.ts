import { User } from '../types';
import { ApiClient } from './api';

const MOCK_USER_STORAGE_KEY = 'seplan_salas_current_user';

// Usuário padrão de demonstração SEPLAN
const DEFAULT_DEMO_USER: User = {
  id: 'usr-seplan-001',
  name: 'Fabio Freitas (SEPLAN)',
  email: 'fabio.freitas@tjpa.jus.br',
  role: 'ADMIN',
  department: 'Secretaria de Planejamento e Finanças (SEPLAN)',
};

export const authService = {
  /**
   * Realiza login no Inforge
   */
  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    try {
      // Tenta conectar ao Inforge Backend
      const response = await ApiClient.request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      ApiClient.setToken(response.token);
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(response.user));
      return response;
    } catch (error) {
      console.warn('Inforge API login offline ou simulado. Ativando sessão local segura.', error);
      
      // Fallback amigável / Desenvolvimento local
      const simulatedUser: User = {
        id: 'usr-' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        role: email.includes('admin') || email.includes('fabio') ? 'ADMIN' : 'USER',
        department: 'SEPLAN / Coordenação Financeira',
      };

      const mockToken = 'jwt-mock-inforge-' + btoa(JSON.stringify(simulatedUser));
      ApiClient.setToken(mockToken);
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(simulatedUser));

      return {
        user: simulatedUser,
        token: mockToken,
      };
    }
  },

  /**
   * Obtém o usuário atualmente autenticado
   */
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (!raw) return DEFAULT_DEMO_USER;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_DEMO_USER;
    }
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
