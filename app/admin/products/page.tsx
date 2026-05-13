'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  apiRequest,
  getAuthMessage,
  getErrorMessage,
  isAuthError,
} from '../../lib/api';
import AuthRequired from '../../components/AuthRequired';

type AdminProduct = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  category: string;
};

const initialFormState: ProductFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: '',
  category: 'mobile',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError('');
      setAuthMessage('');

      const [productList, productCount] = await Promise.all([
        apiRequest<{
          products: AdminProduct[];
        }>('/products?page=1&limit=12'),
        apiRequest<{ count: number }>('/products/count'),
      ]);

      setProducts(productList.products ?? []);
      setCount(productCount.count ?? null);
    } catch (err) {
      if (isAuthError(err)) {
        setAuthMessage(getAuthMessage(err));
        return;
      }

      setError(getErrorMessage(err, 'Failed to load admin products'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setMessage('');
      setError('');

      await apiRequest('/products', 'POST', {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        image_url: form.image_url.trim(),
        category: form.category,
      });

      setForm(initialFormState);
      setMessage('Product created successfully.');
      await loadPageData();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create product'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      setDeletingId(productId);
      setMessage('');
      setError('');

      await apiRequest(`/products/${productId}`, 'DELETE');
      setMessage('Product deleted successfully.');
      await loadPageData();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete product'));
    } finally {
      setDeletingId(null);
    }
  };

  if (authMessage) {
    return <AuthRequired message={authMessage} />;
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Admin</p>
          <h1 style={titleStyle}>Manage Products</h1>
          <p style={subtleTextStyle}>
            Create products, review the latest catalog items, and remove entries
            when needed.
          </p>
        </div>

        <div style={countCardStyle}>
          <span style={countLabelStyle}>Total products</span>
          <strong style={countValueStyle}>
            {loading ? 'Loading...' : (count ?? 'Unavailable')}
          </strong>
        </div>
      </div>

      {error && <p style={errorStyle}>{error}</p>}
      {message && <p style={messageStyle}>{message}</p>}

      <div style={layoutStyle}>
        <form onSubmit={handleSubmit} style={panelStyle}>
          <h2 style={sectionTitleStyle}>Create Product</h2>

          <label style={labelStyle}>
            Name
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Description
            <textarea
              required
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              style={textareaStyle}
            />
          </label>

          <div style={rowStyle}>
            <label style={labelStyle}>
              Price
              <input
                required
                min="0"
                step="0.01"
                type="number"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Stock
              <input
                required
                min="0"
                type="number"
                value={form.stock}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    stock: event.target.value,
                  }))
                }
                style={inputStyle}
              />
            </label>
          </div>

          <label style={labelStyle}>
            Image Path
            <input
              required
              placeholder="/products/macbook.jpg"
              value={form.image_url}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  image_url: event.target.value,
                }))
              }
              style={inputStyle}
            />
            <span style={fieldHintStyle}>
              Use an existing file from the frontend{' '}
              <code>/public/products</code> folder, for example{' '}
              <code>/products/macbook.jpg</code>.
            </span>
          </label>

          <label style={labelStyle}>
            Category
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
              style={inputStyle}
            >
              <option value="mobile">Mobile</option>
              <option value="laptop">Laptop</option>
              <option value="audio">Audio</option>
              <option value="accessories">Accessories</option>
            </select>
          </label>

          <button
            disabled={submitting}
            type="submit"
            style={primaryButtonStyle}
          >
            {submitting ? 'Creating...' : 'Create Product'}
          </button>
        </form>

        <div style={panelStyle}>
          <div style={listHeaderStyle}>
            <h2 style={sectionTitleStyle}>Latest Products</h2>
            <button
              type="button"
              onClick={loadPageData}
              style={secondaryButtonStyle}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p style={subtleTextStyle}>Loading products...</p>
          ) : products.length === 0 ? (
            <p style={subtleTextStyle}>No products found.</p>
          ) : (
            <div style={listStyle}>
              {products.map((product) => (
                <div key={product.id} style={productCardStyle}>
                  <div>
                    <div style={productTitleRowStyle}>
                      <h3 style={productTitleStyle}>{product.name}</h3>
                      <span style={categoryBadgeStyle}>{product.category}</span>
                    </div>
                    <p style={productMetaStyle}>
                      Price: ${product.price.toFixed(2)}
                    </p>
                    <p style={productMetaStyle}>Stock: {product.stock}</p>
                    <p style={productDescriptionStyle}>{product.description}</p>
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === product.id}
                    onClick={() => handleDelete(product.id)}
                    style={deleteButtonStyle}
                  >
                    {deletingId === product.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
  alignItems: 'flex-start',
  gap: '24px',
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
  fontSize: '32px',
  color: '#0f172a',
};

const subtleTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#475569',
  lineHeight: 1.6,
};

const countCardStyle: React.CSSProperties = {
  minWidth: '180px',
  padding: '18px 20px',
  borderRadius: '18px',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  color: '#fff',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
};

const countLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.7)',
};

const countValueStyle: React.CSSProperties = {
  display: 'block',
  marginTop: '8px',
  fontSize: '28px',
};

const layoutStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(300px, 380px) minmax(0, 1fr)',
  gap: '24px',
};

const panelStyle: React.CSSProperties = {
  padding: '24px',
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  boxShadow: '0 14px 36px rgba(15, 23, 42, 0.06)',
};

const sectionTitleStyle: React.CSSProperties = {
  margin: '0 0 18px',
  color: '#0f172a',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '14px',
  color: '#334155',
  fontSize: '14px',
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  padding: '12px 14px',
  fontSize: '14px',
};

const fieldHintStyle: React.CSSProperties = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: 1.5,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: '110px',
  resize: 'vertical',
};

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px',
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  border: 'none',
  borderRadius: '999px',
  background: '#0f172a',
  color: '#fff',
  padding: '12px 18px',
  cursor: 'pointer',
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  borderRadius: '999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  padding: '9px 14px',
  cursor: 'pointer',
};

const deleteButtonStyle: React.CSSProperties = {
  borderRadius: '999px',
  border: 'none',
  background: '#dc2626',
  color: '#fff',
  padding: '10px 16px',
  cursor: 'pointer',
  fontWeight: 600,
  alignSelf: 'flex-start',
};

const listHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '18px',
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const productCardStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '18px',
  padding: '18px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
};

const productTitleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
};

const productTitleStyle: React.CSSProperties = {
  margin: 0,
  color: '#0f172a',
};

const categoryBadgeStyle: React.CSSProperties = {
  borderRadius: '999px',
  background: '#dbeafe',
  color: '#1d4ed8',
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'capitalize',
};

const productMetaStyle: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#334155',
  fontSize: '14px',
};

const productDescriptionStyle: React.CSSProperties = {
  margin: '10px 0 0',
  color: '#475569',
  lineHeight: 1.5,
  maxWidth: '640px',
};

const messageStyle: React.CSSProperties = {
  marginBottom: '18px',
  padding: '12px 14px',
  borderRadius: '12px',
  background: '#dcfce7',
  color: '#166534',
};

const errorStyle: React.CSSProperties = {
  marginBottom: '18px',
  padding: '12px 14px',
  borderRadius: '12px',
  background: '#fee2e2',
  color: '#b91c1c',
};
