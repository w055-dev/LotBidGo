import { useState, useCallback } from 'react';
import api from '../api/client.js';

export default function useBids() {
  const [bids, setBids] = useState([]);
  const [error, setError] = useState('');

  const fetchBids = useCallback(async (lotId) => {
    try {
      const { data } = await api.get(`/bids/lot/${lotId}`);
      setBids(data);
      return data;
    } catch (err) {
      setError('Ошибка загрузки ставок');
      return [];
    }
  }, []);

  const placeBid = useCallback(async (lotId, amount) => {
    const { data } = await api.post('/bids', { lotId, amount });
    return data;
  }, []);

  return { bids, fetchBids, placeBid, error, setError, setBids };
}