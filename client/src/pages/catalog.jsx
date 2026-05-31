import { useEffect, useState } from 'react';
import api from '../api/client.js';

export default function CatalogPage() {
  const [auctions, setAuctions] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [view, setView] = useState('auctions');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const { data } = await api.get('/auctions');
      setAuctions(data);
      setView('auctions');
    } catch (err) {
      setError('Ошибка загрузки аукционов');
    }
  };

  const fetchLots = async (auctionId) => {
    setSelectedAuction(auctionId);
    try {
      const { data } = await api.get(`/lots/auction/${auctionId}`);
      setLots(data);
      setView('lots');
    } catch (err) {
      setError('Ошибка загрузки лотов');
    }
  };

  return (
    <div>
      <h2>Каталог аукционов</h2>
      {error && <div className="error">{error}</div>}

      <div className="tabs">
        <button onClick={fetchAuctions} className={view === 'auctions' ? 'primary' : ''}>
          Все аукционы
        </button>
        {selectedAuction && (
          <button onClick={() => setView('lots')} className={view === 'lots' ? 'primary' : ''}>
            Лоты аукциона №{selectedAuction}
          </button>
        )}
      </div>

      {view === 'auctions' && (
        <div className="card">
          <h3>Предстоящие и прошедшие аукционы</h3>
          {auctions.length === 0 ? (
            <p>Нет аукционов</p>
          ) : (
            <table>
              <thead>
                <tr><th>Дата</th><th>Время</th><th>Место</th><th>Формат</th><th>Специфика</th><th></th></tr>
              </thead>
              <tbody>
                {auctions.map((a) => (
                  <tr key={a.id}>
                    <td>{a.date?.slice(0, 10)}</td>
                    <td>{a.time?.slice(0, 5)}</td>
                    <td>{a.location}</td>
                    <td>{a.format}</td>
                    <td>{a.specification}</td>
                    <td><button onClick={() => fetchLots(a.id)}>Лоты</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === 'lots' && (
        <div className="card">
          <h3>Лоты аукциона №{selectedAuction}</h3>
          <button onClick={fetchAuctions} className="mb-12">Назад к аукционам</button>
          {lots.length === 0 ? (
            <p>Нет лотов</p>
          ) : (
            <table>
              <thead>
                <tr><th>№</th><th>Описание</th><th>Старт. цена</th><th>Статус</th></tr>
              </thead>
              <tbody>
                {lots.map((l) => (
                  <tr key={l.id}>
                    <td>{l.lot_number}</td>
                    <td>{l.description}</td>
                    <td>{l.start_price}</td>
                    <td>{l.status === 'listed' ? 'Ожидает торгов' : l.status === 'in_auction' ? 'В торгах' : l.status === 'sold' ? 'Продан' : l.status === 'unsold' ? 'Не продан' : 'Снят'}</td>
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