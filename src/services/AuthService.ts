import { getApiUrl } from '../config/environment';
import { getCurrentLocale } from '../lib/i18n';

interface LoginResponse {
  userName: string;
  accessToken: string;
}

export class AuthService {
  private static readonly SESSION_KEY = 'teacher_notebook_session';

  static async login(username: string, password: string): Promise<string> {
    const auth = btoa(`${username}:${password}`);
    const apiUrl = await getApiUrl();
    const locale = getCurrentLocale();

    try {
      const response = await fetch(`${apiUrl}/public/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Language': locale
        },
        body: new URLSearchParams({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Verifica tus credenciales.');
        }
        throw new Error('Se ha producido un error al autenticar');
      }
      
      const loginData: LoginResponse = await response.json();
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({
        userName: loginData.userName,
        accessToken: loginData.accessToken,
        timestamp: Date.now()
      }));
      return loginData.userName;
    } catch (error) {
      if (error instanceof Error && error.message === 'Verifica tus credenciales.') {
        throw error;
      }
      throw new Error('Se ha producido un error al autenticar');
    }
  }

  static getSession(): { userName: string; accessToken: string } | null {
    const session = sessionStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  static getAccessToken(): string | null {
    const session = this.getSession();
    return session ? session.accessToken : null;
  }

  static clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  static forceLogout(): void {
    this.clearSession();
    globalThis.dispatchEvent(new CustomEvent('auth:logout'));
  }
}
