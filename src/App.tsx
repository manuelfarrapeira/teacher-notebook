import React, { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { Dashboard } from './components/Dashboard';

type AppState = 'login' | 'loading' | 'dashboard';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppState>('login');

  const handleLogin = (email: string, password: string) => {
    setCurrentScreen('loading');
    
    // Simular autenticación
    setTimeout(() => {
      setCurrentScreen('dashboard');
    }, 2000);
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'loading') {
    return <LoadingScreen />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;