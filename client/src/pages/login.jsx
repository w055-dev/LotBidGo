import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const { role, is_buyer, is_seller } = data.user;
      if (role === 'admin') window.location.href = '/admin';
      else if (is_buyer) window.location.href = '/buyer';
      else if (is_seller) window.location.href = '/seller';
      else window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <div className="card form-card">
      <h2>Вход в систему</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Войти</button>
      </form>
      <p className="form-text">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  );
}