/**
 * Driven port for authentication operations.
 */
export interface AuthPort {
  login(username: string, password: string): Promise<string>;
  getSession(): { userName: string; accessToken: string } | null;
  getAccessToken(): string | null;
  clearSession(): void;
  forceLogout(): void;
}
