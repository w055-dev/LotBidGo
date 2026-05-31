import { useState, useCallback } from 'react';
import api from '../api/client.js';

export default function useAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [error, setError] = useState('');

  const fetchAuctions = useCallback(async () => {
    try {
      const { data } = await api.get('/auctions');
      setAuctions(data.sort((a, b) => a.id - b.id));
    } catch (err) {
      setError('Ошибка загрузки аукционов');
    }
  }, []);

  return { auctions, fetchAuctions, error, setError };
}