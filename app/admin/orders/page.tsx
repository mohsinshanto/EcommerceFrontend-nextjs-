// app/admin/orders/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { apiRequest, getErrorMessage } from '../../lib/api';

type AdminOrder = {
  id: number;
  total_price: number;
  user_id: number;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ orders: AdminOrder[] }>('/admin/orders')
      .then((res) => {
        setOrders(res.orders || []);
      })
      .catch((err) => {
        setError(getErrorMessage(err, 'Failed to fetch admin orders'));
      });
  }, []);

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return <pre>{JSON.stringify(orders, null, 2)}</pre>;
}
