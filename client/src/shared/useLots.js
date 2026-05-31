import { useState, useCallback } from 'react';
import api from '../api/client.js';

export default function useLots() {
  const [lots, setLots] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [error, setError] = useState('');

  const fetchLots = useCallback(async (auctionId) => {
    setSelectedAuction(auctionId);
    try {
      const { data } = await api.get(`/lots/auction/${auctionId}`);
      setLots(data);
      return data;
    } catch (err) {
      setError('Ошибка загрузки лотов');
      return [];
    }
  }, []);

  return { lots, selectedAuction, fetchLots, error, setError, setLots };
}