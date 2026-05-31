import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client.js';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/register', { name, email, password });
      setSuccess('Регистрация успешна.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="card form-card">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <input type="text" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Зарегистрироваться</button>
      </form>
      <p className="form-text">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}