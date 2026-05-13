'use client';

import { useEffect, useState } from 'react';
import {
  apiRequest,
  getAuthMessage,
  getErrorMessage,
  isAuthError,
} from '../../lib/api';
import AuthRequired from '../../components/AuthRequired';

type AdminOrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
};

type AdminOrder = {
  id: number;
  user_id: number;
  user_email: string;
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
  archived: boolean;
  created_at: string;
  items: AdminOrderItem[];
};

type ArchiveFilter = 'active' | 'archived' | 'all';

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [filter, setFilter] = useState<ArchiveFilter>('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError('');
        setAuthMessage('');

        const params = new URLSearchParams({
          page: String(page),
          limit: '6',
          archived: filter,
        });

        const response = await apiRequest<{
          orders: AdminOrder[];
          has_next: boolean;
          has_prev: boolean;
        }>(`/admin/orders?${params.toString()}`);

        setOrders(response.orders ?? []);
        setHasNext(Boolean(response.has_next));
        setHasPrev(Boolean(response.has_prev));
      } catch (err) {
        if (isAuthError(err)) {
          setAuthMessage(getAuthMessage(err));
          return;
        }

        setError(getErrorMessage(err, 'Failed to fetch admin orders'));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [filter, page]);

  if (authMessage) {
    return <AuthRequired message={authMessage} />;
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Admin</p>
          <h1 style={titleStyle}>Order Management</h1>
          <p style={subtleStyle}>
            Review recent orders, inspect delivery details, and keep the admin
            view focused with a small set of cards per page.
          </p>
        </div>

        <div style={filterWrapStyle}>
          {(['active', 'archived', 'all'] as ArchiveFilter[]).map((value) => (
            <button
              key={value}
              onClick={() => {
                setFilter(value);
                setPage(1);
              }}
              style={{
                ...filterButtonStyle,
                ...(filter === value ? activeFilterButtonStyle : {}),
              }}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      {loading ? (
        <p style={subtleStyle}>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p style={subtleStyle}>No orders found for this filter.</p>
      ) : (
        <div style={gridStyle}>
          {orders.map((order) => (
            <article key={order.id} style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div>
                  <div style={orderMetaRowStyle}>
                    <span style={orderIdStyle}>Order #{order.id}</span>
                    <span
                      style={{
                        ...statusBadgeStyle,
                        ...(order.archived ? archivedBadgeStyle : activeBadgeStyle),
                      }}
                    >
                      {order.archived ? 'Archived' : order.status}
                    </span>
                  </div>
                  <p style={dateStyle}>
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                <div style={pricePillStyle}>
                  {order.total_price.toFixed(2)} BDT
                </div>
              </div>

              <div style={infoGridStyle}>
                <div>
                  <p style={labelStyle}>Customer</p>
                  <p style={valueStyle}>{order.customer_name}</p>
                </div>
                <div>
                  <p style={labelStyle}>User Email</p>
                  <p style={valueStyle}>{order.user_email || 'Unavailable'}</p>
                </div>
                <div>
                  <p style={labelStyle}>Phone</p>
                  <p style={valueStyle}>{order.phone}</p>
                </div>
                <div>
                  <p style={labelStyle}>Payment</p>
                  <p style={valueStyle}>{order.payment_method}</p>
                </div>
              </div>

              <div style={addressBoxStyle}>
                <p style={labelStyle}>Delivery Address</p>
                <p style={valueStyle}>
                  {order.address_line}, {order.area}, {order.city}
                  {order.postal_code ? `, ${order.postal_code}` : ''}
                </p>
              </div>

              {order.notes && (
                <div style={addressBoxStyle}>
                  <p style={labelStyle}>Notes</p>
                  <p style={valueStyle}>{order.notes}</p>
                </div>
              )}

              <div>
                <p style={itemsTitleStyle}>Items</p>
                <div style={itemsListStyle}>
                  {order.items.map((item) => (
                    <div key={item.id} style={itemRowStyle}>
                      <div>
                        <p style={itemNameStyle}>{item.product_name}</p>
                        <p style={itemMetaStyle}>
                          Qty: {item.quantity} | Product ID: {item.product_id}
                        </p>
                      </div>
                      <strong style={itemPriceStyle}>
                        {item.price.toFixed(2)} BDT
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div style={paginationStyle}>
        <button
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          disabled={!hasPrev}
          style={{
            ...pagerButtonStyle,
            ...(!hasPrev ? disabledPagerStyle : {}),
          }}
        >
          Prev
        </button>

        <span style={pageTextStyle}>Page {page}</span>

        <button
          onClick={() => setPage((current) => current + 1)}
          disabled={!hasNext}
          style={{
            ...pagerButtonStyle,
            ...(!hasNext ? disabledPagerStyle : {}),
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '32px 20px 48px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  alignItems: 'flex-start',
  marginBottom: '24px',
  flexWrap: 'wrap',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: '10px 0 10px',
  color: '#0f172a',
  fontSize: '32px',
};

const subtleStyle: React.CSSProperties = {
  margin: 0,
  color: '#475569',
  lineHeight: 1.6,
};

const filterWrapStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const filterButtonStyle: React.CSSProperties = {
  borderRadius: '999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  padding: '10px 16px',
  cursor: 'pointer',
};

const activeFilterButtonStyle: React.CSSProperties = {
  background: '#0f172a',
  color: '#fff',
  border: '1px solid #0f172a',
};

const errorStyle: React.CSSProperties = {
  marginBottom: '18px',
  padding: '12px 14px',
  borderRadius: '12px',
  background: '#fee2e2',
  color: '#b91c1c',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '18px',
};

const cardStyle: React.CSSProperties = {
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  boxShadow: '0 14px 36px rgba(15, 23, 42, 0.06)',
  padding: '22px',
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '16px',
};

const orderMetaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const orderIdStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#0f172a',
};

const statusBadgeStyle: React.CSSProperties = {
  borderRadius: '999px',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 700,
};

const activeBadgeStyle: React.CSSProperties = {
  background: '#dcfce7',
  color: '#166534',
};

const archivedBadgeStyle: React.CSSProperties = {
  background: '#e2e8f0',
  color: '#334155',
};

const dateStyle: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#64748b',
  fontSize: '13px',
};

const pricePillStyle: React.CSSProperties = {
  borderRadius: '999px',
  background: '#dbeafe',
  color: '#1d4ed8',
  padding: '10px 14px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const infoGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px',
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#64748b',
  fontWeight: 700,
};

const valueStyle: React.CSSProperties = {
  margin: '6px 0 0',
  color: '#0f172a',
  lineHeight: 1.6,
};

const addressBoxStyle: React.CSSProperties = {
  padding: '14px',
  borderRadius: '14px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
};

const itemsTitleStyle: React.CSSProperties = {
  margin: '0 0 12px',
  color: '#0f172a',
  fontWeight: 700,
};

const itemsListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const itemRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  background: '#fff',
};

const itemNameStyle: React.CSSProperties = {
  margin: 0,
  color: '#0f172a',
  fontWeight: 600,
};

const itemMetaStyle: React.CSSProperties = {
  margin: '6px 0 0',
  color: '#64748b',
  fontSize: '13px',
};

const itemPriceStyle: React.CSSProperties = {
  color: '#0f172a',
  whiteSpace: 'nowrap',
};

const paginationStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '14px',
  marginTop: '28px',
};

const pagerButtonStyle: React.CSSProperties = {
  borderRadius: '999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  padding: '10px 16px',
  cursor: 'pointer',
};

const disabledPagerStyle: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

const pageTextStyle: React.CSSProperties = {
  color: '#334155',
  fontWeight: 600,
};
