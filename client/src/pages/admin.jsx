import { useState, useEffect } from 'react';
import useAuth from '../shared/useAuth.js';
import useAuctions from '../shared/useAuctions.js';
import useLots from '../shared/useLots.js';
import useUsers from '../shared/useUsers.js';
import exportExcel from '../shared/exportExcel.js';
import api from '../api/client.js';

export default function AdminPage() {
  useAuth(['admin']);

  const { auctions, fetchAuctions, error: auctionError } = useAuctions();
  const { lots, selectedAuction, fetchLots, setLots } = useLots();
  const [bidForm, setBidForm] = useState({ lotId: '', userId: '', amount: '' });
  const { users, fetchUsers, toggleSeller, error: userError } = useUsers();
  const [tab, setTab] = useState('auctions');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [auctionForm, setAuctionForm] = useState({ date: '', time: '', location: '', format: 'очный', specification: '' });
  const [lotForm, setLotForm] = useState({ auctionId: '', sellerId: '', description: '', startPrice: '', bidStep: '' });
  const [saleForm, setSaleForm] = useState({ lotId: '', buyerId: '', finalPrice: '' });

  useEffect(() => {
    fetchAuctions();
    fetchUsers();
  }, []);

  const startAuction = async (id) => {
    try {
      await api.post(`/auctions/${id}/start`);
      setSuccess('Аукцион запущен');
      fetchAuctions();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка');
    }
  };

  const finishAuction = async (id) => {
    try {
      await api.post(`/auctions/${id}/finish`);
      setSuccess('Аукцион завершён');
      fetchAuctions();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка');
    }
  };

  const createAuction = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auctions', auctionForm);
      setSuccess('Аукцион создан');
      setAuctionForm({ date: '', time: '', location: '', format: 'очный', specification: '' });
      fetchAuctions();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания аукциона');
    }
  };

  const createLot = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lots', lotForm);
      setSuccess('Лот добавлен');
      setLotForm({ auctionId: '', sellerId: '', description: '', startPrice: '', bidStep: '' });
      if (lotForm.auctionId) fetchLots(lotForm.auctionId);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка добавления лота');
    }
  };

  const createBid = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bids', bidForm);
      setSuccess('Ставка добавлена');
      setBidForm({ lotId: '', userId: '', amount: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка добавления ставки');
    }
  };

  const recordSale = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sales', saleForm);
      setSuccess('Продажа зафиксирована');
      setSaleForm({ lotId: '', buyerId: '', finalPrice: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка фиксации продажи');
    }
  };

  const handleSelectAuction = (id) => {
    fetchLots(id);
    setTab('lots');
  };

  return (
    <div>
      <div className="flex-between mb-20">
        <h2>Панель администратора</h2>
      </div>

      {(error || auctionError || userError) && (
        <div className="error">{error || auctionError || userError}</div>
      )}
      {success && <div className="success">{success}</div>}

      <div className="tabs">
        {['auctions', 'lots', 'create-bid' ,'sales', 'create-auction', 'create-lot','users'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={tab === t ? 'primary' : ''}>
            {t === 'auctions' && 'Аукционы'}
            {t === 'lots' && 'Лоты'}
            {t === 'create-bid' && 'Новая ставка'}
            {t === 'sales' && 'Продажи'}
            {t === 'create-auction' && 'Новый аукцион'}
            {t === 'create-lot' && 'Новый лот'}
            {t === 'users' && 'Пользователи'}
          </button>
        ))}
      </div>

      {tab === 'create-auction' && (
        <div className="card">
          <h3>Создать аукцион</h3>
          <form onSubmit={createAuction}>
            <input placeholder="Дата (ГГГГ-ММ-ДД)" value={auctionForm.date} onChange={(e) => setAuctionForm({ ...auctionForm, date: e.target.value })} required />
            <input placeholder="Время (ЧЧ:ММ)" value={auctionForm.time} onChange={(e) => setAuctionForm({ ...auctionForm, time: e.target.value })} required />
            <input placeholder="Место" value={auctionForm.location} onChange={(e) => setAuctionForm({ ...auctionForm, location: e.target.value })} required />
            <select value={auctionForm.format} onChange={(e) => setAuctionForm({ ...auctionForm, format: e.target.value })}>
              <option value="очный">Очный</option>
              <option value="онлайн">Онлайн</option>
              <option value="гибридный">Гибридный</option>
            </select>
            <input placeholder="Специфика" value={auctionForm.specification} onChange={(e) => setAuctionForm({ ...auctionForm, specification: e.target.value })} />
            <button type="submit" className="primary">Создать</button>
          </form>
        </div>
      )}

      {tab === 'create-lot' && (
        <div className="card">
          <h3>Добавить лот</h3>
          <form onSubmit={createLot}>
            <input placeholder="ID аукциона" value={lotForm.auctionId} onChange={(e) => setLotForm({ ...lotForm, auctionId: e.target.value })} required />
            <input placeholder="ID продавца" value={lotForm.sellerId} onChange={(e) => setLotForm({ ...lotForm, sellerId: e.target.value })} required />
            <input placeholder="Описание" value={lotForm.description} onChange={(e) => setLotForm({ ...lotForm, description: e.target.value })} required />
            <input placeholder="Стартовая цена" type="number" value={lotForm.startPrice} onChange={(e) => setLotForm({ ...lotForm, startPrice: e.target.value })} required />
            <input placeholder="Шаг ставки (необязательно)" type="number" value={lotForm.bidStep} onChange={(e) => setLotForm({ ...lotForm, bidStep: e.target.value })} />
            <button type="submit" className="primary">Добавить</button>
          </form>
        </div>
      )}

      {tab === 'create-bid' && (
        <div className="card">
          <h3>Добавить ставку</h3>
          <form onSubmit={createBid}>
            <input placeholder="ID лота" value={bidForm.lotId} onChange={(e) => setBidForm({ ...bidForm, lotId: e.target.value })} required />
            <input placeholder="ID участника" value={bidForm.userId} onChange={(e) => setBidForm({ ...bidForm, userId: e.target.value })} required />
            <input placeholder="Сумма" type="number" value={bidForm.amount} onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })} required />
            <button type="submit" className="primary">Добавить</button>
          </form>
        </div>
      )}

      {tab === 'auctions' && (
        <div className="card">
          <h3>Аукционы</h3>
          <button onClick={fetchAuctions} className="mb-12">Обновить</button>
          <button onClick={() => exportExcel('auctions', 'auctions.xlsx', setError)} className="mb-12">Экспорт в Excel</button>
          {auctions.length === 0 ? (
            <p>Нет аукционов</p>
          ) : (
            <table>
              <thead>
                <tr><th>ID</th><th>Дата</th><th>Время</th><th>Место</th><th>Формат</th><th>Статус</th><th>Действия</th></tr>
              </thead>
              <tbody>
                {auctions.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.date?.slice(0, 10)}</td>
                    <td>{a.time?.slice(0, 5)}</td>
                    <td>{a.location}</td>
                    <td>{a.format}</td>
                    <td>{a.status}</td>
                    <td>
                      {a.status === 'scheduled' && <button onClick={() => startAuction(a.id)}>Запустить</button>}
                      {a.status === 'live' && <button onClick={() => finishAuction(a.id)}>Завершить</button>}
                      <button onClick={() => handleSelectAuction(a.id)}>Лоты</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'lots' && (
        <div className="card">
          <h3>Лоты {selectedAuction && `(аукцион №${selectedAuction})`}</h3>
          <button onClick={() => selectedAuction && fetchLots(selectedAuction)} className="mb-12">Обновить</button>
          <button onClick={() => selectedAuction && exportExcel(`lots/${selectedAuction}`, `lots-${selectedAuction}.xlsx`, setError)} className="mb-12">Экспорт в Excel</button>
          {lots.length === 0 ? (
            <p>Нет лотов</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>№ лота</th>
                  <th>Описание</th>
                  <th>Продавец ID</th>
                  <th>Старт. цена</th>
                  <th>Текущая ставка</th>
                  <th>Итог. цена</th>
                  <th>Покупатель ID</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.lot_number}</td>
                    <td>{l.description}</td>
                    <td>{l.seller_id}</td>
                    <td>{l.start_price}</td>
                    <td>{l.max_bid || l.start_price}</td>
                    <td>{l.final_price || '—'}</td>
                    <td>{l.final_price ? l.buyer_id || '-' : '-'}</td>
                    <td>{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <h3>Пользователи</h3>
          <button onClick={fetchUsers} className="mb-12">Обновить</button>
          <button onClick={() => exportExcel('users', 'users.xlsx', setError)} className="mb-12">Экспорт в Excel</button>
          {users.length === 0 ? (
            <p>Нет пользователей</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Роль</th>
                  <th>Продавец</th>
                  <th>Покупатель</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.is_seller ? 'Да' : 'Нет'}</td>
                    <td>{u.is_buyer ? 'Да' : 'Нет'}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleSeller(u.id)}>
                          {u.is_seller ? 'Убрать продавца' : 'Сделать продавцом'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'sales' && (
        <div className="card">
          <h3>Зафиксировать продажу</h3>
          <form onSubmit={recordSale}>
            <input placeholder="ID лота" value={saleForm.lotId} onChange={(e) => setSaleForm({ ...saleForm, lotId: e.target.value })} required />
            <input placeholder="ID покупателя" value={saleForm.buyerId} onChange={(e) => setSaleForm({ ...saleForm, buyerId: e.target.value })} required />
            <input placeholder="Итоговая цена" type="number" value={saleForm.finalPrice} onChange={(e) => setSaleForm({ ...saleForm, finalPrice: e.target.value })} required />
            <button type="submit" className="primary">Зафиксировать</button>
          </form>
        </div>
      )}
    </div>
  );
}