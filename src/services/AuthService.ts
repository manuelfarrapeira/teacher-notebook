import { getApiUrl } from '../config/environment';

export class AuthService {
  static async login(username: string, password: string): Promise<string> {
    const auth = btoa(`${username}:${password}`);
    const apiUrl = await getApiUrl();
    
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
      throw new Error('Login failed');
    }
    
    return response.text();
  }
}
