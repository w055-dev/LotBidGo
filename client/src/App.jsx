import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import RegisterPage from './pages/register.jsx';
import AdminPage from './pages/admin.jsx';
import BuyerPage from './pages/buyer.jsx';
import SellerPage from './pages/seller.jsx';
import CatalogPage from './pages/catalog.jsx';

function Layout() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div>
      <header>
        <div className="header-left">
          <Link to="/" className="logo">LotBidGo</Link>
          <Link to="/catalog">Каталог</Link>
        </div>

        <div className="header-right">
          {!user?.role ? (
            <>
              <Link to="/login">Вход</Link>
              <Link to="/register">Регистрация</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' && <Link to="/admin">Админ-панель</Link>}
              {user.is_buyer && <Link to="/buyer">Покупки</Link>}
              {user.is_seller && <Link to="/seller">Мои лоты</Link>}
              <span className="header-user">{user.name}</span>
              <button onClick={logout} className="logout-btn">Выйти</button>
            </>
          )}
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="buyer" element={<BuyerPage />} />
          <Route path="seller" element={<SellerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}