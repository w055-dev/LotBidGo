import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAuth(allowedRoles) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (!token) {
      navigate('/login');
      return;
    }

    if (allowedRoles.includes('admin') && user?.role === 'admin') return;
    if (allowedRoles.includes('buyer') && user?.is_buyer) return;
    if (allowedRoles.includes('seller') && user?.is_seller) return;

    navigate('/login');
  }, [navigate, allowedRoles]);
}