// app/admin/orders/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '../../lib/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    apiRequest('/admin/orders').then(setOrders);
  }, []);

  return <pre>{JSON.stringify(orders, null, 2)}</pre>;
}
