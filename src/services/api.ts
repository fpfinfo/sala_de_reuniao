/// <reference types="vite/client" />

/**
 * Cliente HTTP para integração com Backend Inforge / InsForge.
 * Opera de forma resiliente: se a URL do backend não estiver configurada,
 * delega graciosamente para a camada de persistência local sem disparar erros de DNS.
 */

const INFORGE_API_BASE = import.meta.env.VITE_INFORGE_API_URL || '';

export class ApiClient {
  private static tokenKey = 'seplan_salas_auth_token';

  public static isRemoteConfigured(): boolean {
    return Boolean(INFORGE_API_BASE && INFORGE_API_BASE.trim().length > 0 && !INFORGE_API_BASE.includes('tjpa.jus.br'));
  }

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
    // Se a API remota não estiver configurada explicitamente, lança para que o serviço use o armazenamento local
    if (!this.isRemoteConfigured() && !endpoint.startsWith('http')) {
      throw new Error('LOCAL_MODE');
    }

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
      throw err;
    }
  }
}
