'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  apiRequest,
  getAuthMessage,
  getErrorMessage,
  isAuthError,
} from '../lib/api';
import AuthRequired from '../components/AuthRequired';

type CartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
};

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const updateQuantity = async (cartId: number, quantity: number) => {
    try {
      setError('');
      setActionMessage('');
      await apiRequest(`/cart/${cartId}`, 'PUT', {
        quantity,
      });

      await fetchCart();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update quantity'));
    }
  };

  const fetchCart = async () => {
    try {
      setAuthMessage('');
      setError('');
      const res = await apiRequest<{ cart: CartItem[] }>('/cart');
      setCart(res.cart || []);
    } catch (err) {
      if (isAuthError(err)) {
        setAuthMessage(getAuthMessage(err));
        setCart([]);
        return;
      }

      setError(getErrorMessage(err, 'Failed to load cart'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);
  const removeItem = async (id: number) => {
    try {
      setError('');
      setActionMessage('');
      await apiRequest(`/cart/${id}`, 'DELETE');
      setActionMessage('Item removed from cart.');
      await fetchCart();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to remove item'));
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) return <p>Loading cart...</p>;
  if (authMessage) {
    return <AuthRequired message={authMessage} />;
  }
  if (error && cart.length === 0) {
    return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;
  }

  if (cart.length === 0) {
    return (
      <div style={emptyWrapStyle}>
        <div style={emptyCardStyle}>
          <p style={emptyEyebrowStyle}>Your Cart</p>
          <h2 style={emptyTitleStyle}>Your cart is empty</h2>
          <p style={emptyMessageStyle}>
            Add a few products to your cart and they will appear here when you
            are ready to checkout.
          </p>
          <button
            onClick={() => router.push('/products')}
            style={emptyButtonStyle}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Your Cart</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {actionMessage && (
        <p style={{ color: 'green', textAlign: 'center' }}>{actionMessage}</p>
      )}

      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #ddd',
            padding: '15px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Image
              src={item.product.image_url}
              alt={item.product.name}
              width={100}
              height={80}
              style={{
                objectFit: 'cover',
                borderRadius: '5px',
              }}
            />

            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>{item.product.name}</h4>
              <p style={{ margin: '2px 0' }}>
                Price: ${item.product.price.toFixed(2)}
              </p>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  style={{
                    padding: '4px 10px',
                    cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    padding: '4px 10px',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
              <p style={{ margin: '2px 0' }}>
                Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            style={{
              padding: '6px 12px',
              background: 'red',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <div
        style={{
          marginTop: '20px',
          textAlign: 'right',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        Total: ${total.toFixed(2)}
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={() => router.push('/checkout')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: '#0f172a',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

const emptyWrapStyle: React.CSSProperties = {
  minHeight: '55vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const emptyCardStyle: React.CSSProperties = {
  maxWidth: '520px',
  width: '100%',
  textAlign: 'center',
  padding: '36px 32px',
  borderRadius: '18px',
  border: '1px solid #e5e7eb',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
};

const emptyEyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '12px',
  fontWeight: 700,
};

const emptyTitleStyle: React.CSSProperties = {
  margin: '12px 0 10px',
  color: '#0f172a',
};

const emptyMessageStyle: React.CSSProperties = {
  margin: '0 0 22px',
  color: '#475569',
  lineHeight: 1.6,
};

const emptyButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  background: '#0f172a',
  color: '#fff',
  padding: '11px 18px',
  cursor: 'pointer',
};
