import { useEffect, useState } from 'react';
import useAuth from '../shared/useAuth.js';
import useLots from '../shared/useLots.js';
import useRevenue from '../shared/useRevenue.js';
import api from '../api/client.js';

export default function SellerPage() {
  useAuth(['seller']);

  const { lots, fetchLots, setLots } = useLots();
  const { revenue, fetchRevenue } = useRevenue();
  const [tab, setTab] = useState('lots');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyLots();
    fetchRevenue();
  }, []);

  const fetchMyLots = async () => {
    try {
      const { data } = await api.get('/lots/my');
      setLots(data);
    } catch (err) {
      setError('Ошибка загрузки лотов');
    }
  };

  const withdrawLot = async (id) => {
    try {
      await api.put(`/lots/${id}/withdraw`);
      fetchMyLots();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отзыва лота');
    }
  };

  return (
    <div>
      <div className="flex-between mb-20">
        <h2>Кабинет продавца</h2>
      </div>

      {error && <div className="error">{error}</div>}

      {revenue && (
        <div className="card">
          <h3>Доход от продаж</h3>
          <p>Всего продано: <strong>{revenue.sold_count}</strong> лотов</p>
          <p>Общая выручка: <strong>{revenue.total_revenue} руб.</strong></p>
        </div>
      )}

      <div className="tabs">
        <button onClick={() => setTab('lots')} className={tab === 'lots' ? 'primary' : ''}>Мои лоты</button>
      </div>

      {tab === 'lots' && (
        <div className="card">
          <h3>Мои лоты</h3>
          <button onClick={fetchMyLots} className="mb-12">Обновить</button>
          {lots.length === 0 ? (
            <p>У вас нет лотов</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>№</th>
                  <th>Описание</th>
                  <th>Старт. цена</th>
                  <th>Итог. цена</th>
                  <th>Статус</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lots.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.lot_number}</td>
                    <td>{l.description}</td>
                    <td>{l.start_price}</td>
                    <td>{l.final_price || '—'}</td>
                    <td>{l.status}</td>
                    <td>
                      {l.status === 'listed' && (
                        <button onClick={() => withdrawLot(l.id)}>Отозвать</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}