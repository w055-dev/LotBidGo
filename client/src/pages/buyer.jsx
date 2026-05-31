import { useState, useEffect } from 'react';
import useAuth from '../shared/useAuth.js';
import useAuctions from '../shared/useAuctions.js';
import useLots from '../shared/useLots.js';
import useBids from '../shared/useBids.js';
import usePurchases from '../shared/usePurchases.js';

export default function BuyerPage() {
  useAuth(['buyer']);

  const { auctions, fetchAuctions, error: auctionError } = useAuctions();
  const { lots, selectedAuction, fetchLots } = useLots();
  const { bids, fetchBids, placeBid } = useBids();
  const { purchases, fetchPurchases } = usePurchases();
  const [tab, setTab] = useState('auctions');
  const [bidAmount, setBidAmount] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAuctions();
    fetchPurchases();
  }, []);

  const handleBid = async (lotId) => {
    const amount = parseFloat(bidAmount[lotId]);
    if (!amount || amount <= 0) {
      setError('Введите корректную сумму');
      return;
    }
    try {
      await placeBid(lotId, amount);
      setSuccess('Ставка принята');
      setBidAmount({ ...bidAmount, [lotId]: '' });
      fetchLots(selectedAuction);
      fetchBids(lotId);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка ставки');
    }
  };

  const handleViewLots = async (auctionId) => {
    await fetchLots(auctionId);
    setTab('lots');
  };

  const handleViewBids = async (lotId) => {
    await fetchBids(lotId);
    setTab('bids');
  };

  return (
    <div>
      <div className="flex-between mb-20">
        <h2>Кабинет покупателя</h2>
      </div>

      {(error || auctionError) && <div className="error">{error || auctionError}</div>}
      {success && <div className="success">{success}</div>}

      <div className="tabs">
        <button onClick={() => setTab('auctions')} className={tab === 'auctions' ? 'primary' : ''}>Аукционы</button>
        <button onClick={() => setTab('purchases')} className={tab === 'purchases' ? 'primary' : ''}>Мои покупки</button>
      </div>

      {tab === 'auctions' && (
        <div className="card">
          <h3>Аукционы</h3>
          {auctions.length === 0 ? (
            <p>Нет аукционов</p>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Дата</th><th>Место</th><th>Формат</th><th>Статус</th><th></th></tr>
              </thead>
              <tbody>
                {auctions.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.date?.slice(0, 10)}</td>
                    <td>{a.location}</td>
                    <td>{a.format}</td>
                    <td>{a.status}</td>
                    <td><button onClick={() => handleViewLots(a.id)}>Лоты</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'lots' && (
        <div className="card">
          <h3>Лоты аукциона №{selectedAuction}</h3>
          <button onClick={() => setTab('auctions')} className="mb-12">Назад</button>
          {lots.length === 0 ? (
            <p>Нет лотов</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Описание</th>
                  <th>Старт. цена</th>
                  <th>Текущая ставка</th>
                  <th>Статус</th>
                  <th>Покупатель ID</th>
                  <th>Ставка</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lots.map((l) => (
                  <tr key={l.id}>
                    <td>{l.lot_number}</td>
                    <td>{l.description}</td>
                    <td>{l.start_price}</td>
                    <td>{l.max_bid || l.start_price}</td>
                    <td>{l.status}</td>
                    <td>{l.status === 'sold' && l.buyer_id ? l.buyer_id : '—'}</td>
                    <td>
                      {l.status === 'in_auction' ? (
                        <input
                          type="number"
                          placeholder="Сумма"
                          className="input-small"
                          value={bidAmount[l.id] || ''}
                          onChange={(e) => setBidAmount({ ...bidAmount, [l.id]: e.target.value })}
                        />
                      ): l.status === 'sold' ? (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>Торги завершены</span>
                        ) : l.status === 'listed' ? (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>Ожидает запуска</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: 12 }}>Недоступно</span>
                        )}
                    </td>
                    <td>
                      {l.status === 'in_auction' && (
                        <button onClick={() => handleBid(l.id)}>Ставка</button>
                      )}
                      <button onClick={() => handleViewBids(l.id)}>История</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'bids' && (
        <div className="card">
          <h3>История ставок</h3>
          <button onClick={() => setTab('lots')} className="mb-12">Назад</button>
          {bids.length === 0 ? (
            <p>Нет ставок</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Участник ID</th>
                  <th>Сумма</th>
                  <th>Время</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((b) => (
                  <tr key={b.id}>
                    <td>{b.bidder_id}</td>
                    <td>{b.amount}</td>
                    <td>{new Date(b.bid_time).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'purchases' && (
        <div className="card">
          <h3>Мои покупки</h3>
          {purchases.length === 0 ? (
            <p>Нет покупок</p>
          ) : (
            <table>
              <thead>
                <tr><th>Лот</th><th>Цена</th><th>Дата</th></tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td>№{p.lot_id}</td>
                    <td>{p.final_price}</td>
                    <td>{new Date(p.sale_time).toLocaleString()}</td>
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