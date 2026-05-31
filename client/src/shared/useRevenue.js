import { useState, useCallback } from 'react';
import api from '../api/client.js';

export default function useRevenue() {
  const [revenue, setRevenue] = useState(null);
  const [error, setError] = useState('');

  const fetchRevenue = useCallback(async () => {
    try {
      const { data } = await api.get('/sales/my-revenue');
      setRevenue(data);
    } catch (err) {
      setError('Не удалось загрузить доход');
    }
  }, []);

  return { revenue, fetchRevenue };
}