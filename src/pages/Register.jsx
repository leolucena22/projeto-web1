import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

/**
 * Register — Tela de cadastro de novo usuário.
 */
const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    avatar: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('Nome, e-mail e senha são obrigatórios.');
      return;
    }

    const result = register(form);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="page-content">
      <div className="auth-container animate-fade-in-up">
        <div className="auth-card card">
          <div className="auth-header">
            <h1>Criar Conta</h1>
            <p className="text-secondary">Junte-se ao Brechó Online</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="reg-name">Nome completo *</label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">E-mail *</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Senha *</label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="Mínimo 4 caracteres"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="reg-phone">Telefone</label>
                <input
                  id="reg-phone"
                  type="text"
                  className="form-input"
                  placeholder="(11) 99999-0000"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-address">Cidade / Estado</label>
                <input
                  id="reg-address"
                  type="text"
                  className="form-input"
                  placeholder="São Paulo, SP"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-avatar">URL do Avatar (opcional)</label>
              <input
                id="reg-avatar"
                type="url"
                className="form-input"
                placeholder="https://exemplo.com/foto.jpg"
                value={form.avatar}
                onChange={(e) => handleChange('avatar', e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block">
              Criar Conta
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Já tem conta?{' '}
              <Link to="/login">Faça login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
