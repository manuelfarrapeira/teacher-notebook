import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { Dashboard } from './components/Dashboard';
import { AuthService } from './services/AuthService';

type AppState = 'login' | 'loading' | 'dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppState>('login');
  const [userName, setUserName] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

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
      setLoginError('Error en el login. Verifica tus credenciales.');
      setCurrentScreen('login');
    }
  };

  const handleLogout = () => {
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
