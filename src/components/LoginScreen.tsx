import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

export function LoginScreen({ onLogin, error }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-container">
      {/* Elementos decorativos de fondo */}
      <div className="login-bg-elements">
        <div className="login-bg-icon book">
          <BookOpen className="icon-bg-book" />
        </div>
        <div className="login-bg-icon graduation">
          <GraduationCap className="icon-bg-graduation" />
        </div>
        <div className="login-bg-icon users">
          <Users className="icon-bg-users" />
        </div>
        <div className="login-bg-icon award">
          <Award className="icon-bg-award" />
        </div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-container">
            <div className="login-main-icon">
              <GraduationCap className="icon-main" />
            </div>
            <div className="login-badge">
              <Award className="icon-badge" />
            </div>
          </div>
          <h1 className="login-title">Teacher Notebook</h1>
          <p className="login-subtitle">Tu espacio educativo digital</p>
          <div className="login-tagline">
            <BookOpen className="icon-tagline" />
            <span>Gestión académica profesional</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <Label htmlFor="username" className="login-label">Usuario</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_usuario"
              required
              className="login-input"
            />
          </div>
          
          <div className="login-field">
            <Label htmlFor="password" className="login-label">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="login-input"
            />
          </div>

          <Button type="submit" className="login-button">
            <GraduationCap className="icon-button" />
            Acceder al Aula
          </Button>

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </form>

        <div className="login-footer">
          <p className="login-forgot">
            ¿Olvidaste tu contraseña?{' '}
            <a href="#" className="login-link">
              Recuperar acceso
            </a>
          </p>
          <div className="login-features">
            <div className="login-feature students">
              <Users className="icon-feature" />
              <span>Estudiantes</span>
            </div>
            <div className="login-dot pink-purple"></div>
            <div className="login-feature classes">
              <BookOpen className="icon-feature" />
              <span>Clases</span>
            </div>
            <div className="login-dot purple-cyan"></div>
            <div className="login-feature evaluations">
              <Award className="icon-feature" />
              <span>Evaluaciones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
