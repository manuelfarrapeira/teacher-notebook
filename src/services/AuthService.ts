import { getApiUrl } from '../config/environment';

export class AuthService {
  private static readonly SESSION_KEY = 'teacher_notebook_session';

  static async login(username: string, password: string): Promise<string> {
    const auth = btoa(`${username}:${password}`);
    const apiUrl = await getApiUrl();
    
    try {
      const response = await fetch(`${apiUrl}/public/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
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
      
      const userName = await response.text();
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify({ userName, timestamp: Date.now() }));
      return userName;
    } catch (error) {
      if (error instanceof Error && error.message === 'Verifica tus credenciales.') {
        throw error;
      }
      throw new Error('Se ha producido un error al autenticar');
    }
  }

  static getSession(): { userName: string } | null {
    const session = sessionStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  static clearSession(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
  }
}
