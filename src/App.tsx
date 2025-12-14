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
  }, []);

  useEffect(() => {
    document.title = userName ? `Teacher Notebook - ${userName}` : 'Teacher Notebook';
  }, [userName]);

  const handleLogin = async (username: string, password: string) => {
    setLoginError('');

    if (!username || !password) {
      setLoginError('Por favor completa todos los campos.');
      return;
    }

    setCurrentScreen('loading');
    
    try {
      const name = await AuthService.login(username, password);
      setUserName(name);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Se ha producido un error al autenticar';
      setLoginError(`Error en el login. ${errorMessage}`);
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

  return <Dashboard userName={userName} onLogout={handleLogout} />;
}

export default App;
