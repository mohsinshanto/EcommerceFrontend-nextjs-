'use client';

import { useEffect, useState } from 'react';
import {
  apiRequest,
  getAuthMessage,
  getErrorMessage,
  isAuthError,
} from '../lib/api';
import Toast from '../components/Toast';
import AuthRequired from '../components/AuthRequired';

type Order = {
  id: number;
  customer_name: string;
  phone: string;
  address_line: string;
  city: string;
  area: string;
  postal_code: string;
  notes: string;
  payment_method: string;
  status: string;
  total_price: number;
  created_at: string;
};

function formatPublicOrderNumber(order: Order) {
  const createdAt = new Date(order.created_at);

  if (Number.isNaN(createdAt.getTime())) {
    return `ORD-${String(order.id).padStart(6, '0')}`;
  }

  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, '0');
  const day = String(createdAt.getDate()).padStart(2, '0');

  return `ORD-${year}${month}${day}-${String(order.id).padStart(6, '0')}`;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState('');
  const [archivingOrderId, setArchivingOrderId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    variant: 'success' | 'error';
  }>({
    open: false,
    message: '',
    variant: 'success',
  });

  useEffect(() => {
    apiRequest<{ orders: Order[] }>('/orders')
      .then((res) => {
        setOrders(res.orders || []);
      })
      .catch((err) => {
        if (isAuthError(err)) {
          setAuthMessage(getAuthMessage(err));
          return;
        }

        setError(getErrorMessage(err, 'Failed to fetch orders'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const archiveOrder = async (orderId: number) => {
    try {
      setError('');
      setArchivingOrderId(orderId);
      await apiRequest(`/orders/${orderId}/archive`, 'PATCH');
      setOrders((current) => current.filter((order) => order.id !== orderId));
      setToast({
        open: true,
        message: 'Order archived from your history.',
        variant: 'success',
      });
    } catch (err) {
      setToast({
        open: true,
        message: getErrorMessage(err, 'Failed to archive order'),
        variant: 'error',
      });
    } finally {
      setArchivingOrderId(null);
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
  if (authMessage) return <AuthRequired message={authMessage} />;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;

  return (
    <div style={containerStyle}>
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />

      <h2 style={{ marginBottom: '20px' }}>My Orders History</h2>

      {orders.length === 0 ? (
        <p style={emptyStateStyle}>
          You do not have any active orders in your history yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.map((order) => (
            <div key={order.id} style={cardStyle}>
              <p>
                <strong>Order Number:</strong> {formatPublicOrderNumber(order)}
              </p>
              <p>
                <strong>Customer:</strong> {order.customer_name}
              </p>
              <p>
                <strong>Phone:</strong> {order.phone}
              </p>
              <p>
                <strong>Payment:</strong> {order.payment_method}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Total:</strong> {order.total_price.toFixed(2)} BDT
              </p>
              <p>
                <strong>Delivery Address:</strong> {order.address_line},{' '}
                {order.area}, {order.city}
                {order.postal_code ? `, ${order.postal_code}` : ''}
              </p>
              {order.notes && (
                <p>
                  <strong>Notes:</strong> {order.notes}
                </p>
              )}
              <p>
                <strong>Date:</strong>{' '}
                {new Date(order.created_at).toLocaleDateString()}
              </p>
              <button
                onClick={() => archiveOrder(order.id)}
                disabled={archivingOrderId === order.id}
                style={archiveButtonStyle}
              >
                {archivingOrderId === order.id ? 'Archiving...' : 'Archive'}
              </button>
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

const archiveButtonStyle: React.CSSProperties = {
  marginTop: '10px',
  border: 'none',
  backgroundColor: '#111827',
  color: '#fff',
  borderRadius: '999px',
  padding: '8px 14px',
  cursor: 'pointer',
};

const emptyStateStyle: React.CSSProperties = {
  padding: '18px 20px',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  backgroundColor: '#f8fafc',
  color: '#475569',
};
