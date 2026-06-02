import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

/**
 * Login — Tela de login com e-mail e senha.
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Preencha todos os campos.');
      return;
    }

    const result = login(form.email, form.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="page-content">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-card card">
          <div className="auth-header">
            <h1>Entrar</h1>
            <p className="text-secondary">Acesse sua conta no Brechó Online</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Senha</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="Sua senha"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block">
              Entrar
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Não tem conta?{' '}
              <Link to="/register">Cadastre-se</Link>
            </p>
          </div>

          <div className="auth-demo">
            <p className="text-xs text-muted">Contas de demonstração:</p>
            <div className="demo-accounts">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setForm({ email: 'maria@demo.com', password: '123456' })}
              >
                Maria (maria@demo.com)
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setForm({ email: 'joao@demo.com', password: '123456' })}
              >
                João (joao@demo.com)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
