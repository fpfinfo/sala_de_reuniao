/// <reference types="vite/client" />

/**
 * Cliente HTTP para integração com Backend Inforge.
 * Gerencia autenticação Bearer Token, headers padrão e tratamento de erros.
 */

const INFORGE_API_BASE = import.meta.env.VITE_INFORGE_API_URL || 'https://api.inforge.tjpa.jus.br/api/v1';

export class ApiClient {
  private static tokenKey = 'seplan_salas_auth_token';

  public static getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public static setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  public static clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  public static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const url = endpoint.startsWith('http') ? endpoint : `${INFORGE_API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expirado ou inválido
        this.clearToken();
        window.dispatchEvent(new Event('auth:unauthorized'));
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(
          errorBody.message || `Erro na requisição Inforge (${response.status}): ${response.statusText}`
        );
      }

      return (await response.json()) as T;
    } catch (err: any) {
      // Repassa ou formata erro amigável
      throw err;
    }
  }
}
