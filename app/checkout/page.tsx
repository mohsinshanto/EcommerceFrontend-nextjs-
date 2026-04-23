'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  apiRequest,
  getAuthMessage,
  getErrorMessage,
  isAuthError,
} from '../lib/api';
import AuthRequired from '../components/AuthRequired';
import Toast from '../components/Toast';

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

type CheckoutForm = {
  customer_name: string;
  phone: string;
  address_line: string;
  city: string;
  area: string;
  postal_code: string;
  notes: string;
};

const initialForm: CheckoutForm = {
  customer_name: '',
  phone: '',
  address_line: '',
  city: '',
  area: '',
  postal_code: '',
  notes: '',
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
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
    const fetchCart = async () => {
      try {
        setAuthMessage('');
        setError('');
        const res = await apiRequest<{ cart: CartItem[] }>('/cart');
        setCart(res.cart || []);
      } catch (err) {
        if (isAuthError(err)) {
          setAuthMessage(getAuthMessage(err));
          return;
        }

        setError(getErrorMessage(err, 'Failed to load checkout'));
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (
      !form.customer_name.trim() ||
      !form.phone.trim() ||
      !form.address_line.trim() ||
      !form.city.trim() ||
      !form.area.trim()
    ) {
      setError('Please complete the delivery information.');
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest('/order', 'POST', {
        ...form,
        payment_method: 'cod',
      });
      setToast({
        open: true,
        message: 'Order placed successfully. Redirecting to your orders...',
        variant: 'success',
      });
      window.setTimeout(() => {
        router.push('/orders');
      }, 900);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to place order');
      setError(message);
      setToast({
        open: true,
        message,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Loading checkout...</p>;
  if (authMessage) return <AuthRequired message={authMessage} />;

  if (cart.length === 0) {
    return (
      <div style={emptyWrapStyle}>
        <div style={emptyCardStyle}>
          <p style={eyebrowStyle}>Checkout</p>
          <h2 style={titleStyle}>Your cart is empty</h2>
          <p style={messageStyle}>
            Add some products before you move to checkout.
          </p>
          <button
            onClick={() => router.push('/products')}
            style={primaryButtonStyle}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />

      <div style={layoutStyle}>
        <form onSubmit={submitOrder} style={panelStyle}>
          <p style={eyebrowStyle}>Checkout</p>
          <h1 style={headingStyle}>Delivery Details</h1>
          <p style={subtleTextStyle}>
            Payment method: <strong>Cash on Delivery</strong>
          </p>

          <div style={fieldGridStyle}>
            <input
              name="customer_name"
              placeholder="Full name"
              value={form.customer_name}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="phone"
              placeholder="Mobile number"
              value={form.phone}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              name="area"
              placeholder="Area / locality"
              value={form.area}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <input
            name="address_line"
            placeholder="Address line (e.g. House 12, Road 5, Dhanmondi)"
            value={form.address_line}
            onChange={handleChange}
            style={{ ...inputStyle, marginTop: '14px' }}
          />

          <input
            name="postal_code"
            placeholder="Postal code (optional, e.g. 1205)"
            value={form.postal_code}
            onChange={handleChange}
            style={{ ...inputStyle, marginTop: '14px' }}
          />

          <textarea
            name="notes"
            placeholder="Delivery notes (optional, e.g. Call me before arrival)"
            value={form.notes}
            onChange={handleChange}
            style={textareaStyle}
          />

          {error && <p style={errorStyle}>{error}</p>}

          <div style={actionRowStyle}>
            <button
              type="button"
              onClick={() => router.push('/cart')}
              style={secondaryButtonStyle}
            >
              Back to Cart
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={primaryButtonStyle}
            >
              {submitting ? 'Placing Order...' : 'Confirm Cash on Delivery'}
            </button>
          </div>
        </form>

        <div style={panelStyle}>
          <p style={eyebrowStyle}>Order Summary</p>
          <h2 style={summaryHeadingStyle}>Review Items</h2>

          <div style={summaryListStyle}>
            {cart.map((item) => (
              <div key={item.id} style={summaryItemStyle}>
                <div>
                  <p style={summaryItemNameStyle}>{item.product.name}</p>
                  <p style={summaryItemMetaStyle}>
                    Qty {item.quantity} x {item.product.price.toFixed(2)} BDT
                  </p>
                </div>
                <strong>
                  {(item.product.price * item.quantity).toFixed(2)} BDT
                </strong>
              </div>
            ))}
          </div>

          <div style={totalRowStyle}>
            <span>Total</span>
            <strong>{total.toFixed(2)} BDT</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  padding: '24px 16px 40px',
};

const layoutStyle: React.CSSProperties = {
  maxWidth: '1100px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '24px',
  alignItems: 'start',
};

const panelStyle: React.CSSProperties = {
  padding: '28px',
  borderRadius: '18px',
  border: '1px solid #e5e7eb',
  background: '#fff',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '12px',
  fontWeight: 700,
};

const headingStyle: React.CSSProperties = {
  margin: '10px 0 8px',
  color: '#0f172a',
};

const subtleTextStyle: React.CSSProperties = {
  margin: '0 0 18px',
  color: '#475569',
};

const fieldGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '14px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  outline: 'none',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '110px',
  marginTop: '14px',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  outline: 'none',
  resize: 'vertical',
};

const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '18px',
};

const primaryButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  background: '#0f172a',
  color: '#fff',
  padding: '12px 18px',
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: '999px',
  background: '#fff',
  color: '#0f172a',
  padding: '12px 18px',
  cursor: 'pointer',
};

const summaryHeadingStyle: React.CSSProperties = {
  margin: '10px 0 16px',
  color: '#0f172a',
};

const summaryListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const summaryItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  paddingBottom: '14px',
  borderBottom: '1px solid #e5e7eb',
};

const summaryItemNameStyle: React.CSSProperties = {
  margin: 0,
  color: '#0f172a',
  fontWeight: 600,
};

const summaryItemMetaStyle: React.CSSProperties = {
  margin: '4px 0 0',
  color: '#64748b',
  fontSize: '14px',
};

const totalRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '18px',
  fontSize: '18px',
  color: '#0f172a',
};

const errorStyle: React.CSSProperties = {
  margin: '14px 0 0',
  color: '#b91c1c',
};

const emptyWrapStyle: React.CSSProperties = {
  minHeight: '55vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const emptyCardStyle: React.CSSProperties = {
  maxWidth: '480px',
  width: '100%',
  textAlign: 'center',
  padding: '32px',
  borderRadius: '18px',
  border: '1px solid #e5e7eb',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
};

const titleStyle: React.CSSProperties = {
  margin: '12px 0 10px',
  color: '#0f172a',
};

const messageStyle: React.CSSProperties = {
  margin: '0 0 22px',
  color: '#475569',
  lineHeight: 1.6,
};
