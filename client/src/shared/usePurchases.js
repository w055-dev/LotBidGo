import { useState, useCallback } from 'react';
import api from '../api/client.js';

export default function usePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState('');

  const fetchPurchases = useCallback(async () => {
    try {
      const { data } = await api.get('/sales/my');
      setPurchases(data);
    } catch (err) {
        setError('Не удалось загрузить покупки');
    }
  }, []);

  return { purchases, fetchPurchases, setPurchases };
}