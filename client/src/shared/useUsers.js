import { useState, useCallback } from 'react';
import api from '../api/client.js';

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    }
  }, []);

  const toggleSeller = useCallback(async (id) => {
    await api.put(`/users/${id}/toggle-seller`);
    const { data } = await api.get('/users');
    setUsers(data);
  }, []);

  return { users, fetchUsers, toggleSeller, error, setError };
}