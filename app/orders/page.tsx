'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

type Order = {
  id: number;
  total_price: number;
  created_at: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/orders')
      .then((res) => {
        console.log(res.data);
        setOrders(res.data); // DTO array
      })
      .catch(() => {
        setError('Failed to fetch orders');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;

  return (
    <div style={containerStyle}>
      <h2 style={{ marginBottom: '20px' }}>My Orders History</h2>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order) => (
            <div key={order.id} style={cardStyle}>
              <p>
                <strong>Order ID:</strong> {order.id}
              </p>
              <p>
                <strong>Total:</strong> {order.total_price}BDT
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Styles ---------- */

const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '40px auto',
  padding: '20px',
};

const cardStyle: React.CSSProperties = {
  padding: '15px',
  border: '1px solid #ddd',
  borderRadius: '6px',
};
