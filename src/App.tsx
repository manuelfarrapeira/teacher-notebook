import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { Dashboard } from './components/Dashboard';
import { AuthService } from './services/AuthService';

type AppState = 'login' | 'loading' | 'dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppState>('loading');
  const [userName, setUserName] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  useEffect(() => {
    const session = AuthService.getSession();
    if (session) {
      setUserName(session.userName);
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('login');
    }

    // Escuchar evento de logout forzado
    const handleForceLogout = () => {
      setUserName('');
      setCurrentScreen('login');
      setLoginError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    };

    globalThis.addEventListener('auth:logout', handleForceLogout);
    return () => globalThis.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  useEffect(() => {
    document.title = userName ? `Teacher Notebook - ${userName}` : 'Teacher Notebook';
  }, [userName]);

  const handleLogin = async (username: string, password: string) => {
    setLoginError('');

    if (!username || !password) {
      setLoginError(t('login.errors.emptyFields'));
      return;
    }

    setCurrentScreen('loading');
    
    try {
      const name = await AuthService.login(username, password);
      setUserName(name);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : t('login.errors.authError');
      setLoginError(`${t('login.errors.loginFailed')} ${errorMessage}`);
      setCurrentScreen('login');
    }
  };

  const handleLogout = () => {
    AuthService.clearSession();
    setUserName('');
    setCurrentScreen('login');
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }

  if (currentScreen === 'loading') {
    return <LoadingScreen />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;
