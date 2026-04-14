'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  apiRequest,
  getAuthMessage,
  getErrorMessage,
  isAuthError,
} from '../../lib/api';
import Toast from '../../components/Toast';
import AuthRequired from '../../components/AuthRequired';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
};

export default function ProductDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
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
    const fetchProduct = async () => {
      try {
        setAuthMessage('');
        setError('');
        const res = await apiRequest<Product>(`/products/${id}`);
        setProduct(res);
      } catch (err) {
        if (isAuthError(err)) {
          setAuthMessage(getAuthMessage(err));
          return;
        }

        setError(getErrorMessage(err, 'Failed to load product'));
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!product) {
      return;
    }

    try {
      setAddingToCart(true);
      setError('');
      await apiRequest('/cart', 'POST', {
        product_id: product.id,
        quantity: 1,
      });
      setToast({
        open: true,
        message: 'Item added to your cart.',
        variant: 'success',
      });
    } catch (err) {
      setToast({
        open: true,
        message: getErrorMessage(err, 'Failed to add product to cart'),
        variant: 'error',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (authMessage) return <AuthRequired message={authMessage} />;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div style={pageStyle}>
      <Toast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        actionLabel={toast.variant === 'success' ? 'View cart' : undefined}
        onAction={
          toast.variant === 'success' ? () => router.push('/cart') : undefined
        }
      />

      <div style={contentStyle}>
        <div style={imageWrapStyle}>
          <Image
            src={product.image_url}
            alt={product.name}
            width={800}
            height={600}
            style={imageStyle}
          />
        </div>

        <div style={detailsStyle}>
          <p style={eyebrowStyle}>{product.category}</p>
          <h1 style={titleStyle}>{product.name}</h1>

          <p style={descriptionStyle}>{product.description}</p>

          <div style={metaRowStyle}>
            <h2 style={priceStyle}>${product.price.toFixed(2)}</h2>
            <span style={stockStyle}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button
            onClick={addToCart}
            disabled={product.stock === 0 || addingToCart}
            style={{
              ...buttonStyle,
              cursor:
                product.stock === 0 || addingToCart
                  ? 'not-allowed'
                  : 'pointer',
              opacity: product.stock === 0 || addingToCart ? 0.7 : 1,
            }}
          >
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  padding: '24px 16px',
};

const contentStyle: React.CSSProperties = {
  maxWidth: '1080px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '28px',
  alignItems: 'start',
};

const imageWrapStyle: React.CSSProperties = {
  borderRadius: '22px',
  overflow: 'hidden',
  background: '#f8fafc',
  border: '1px solid #e5e7eb',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
};

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: 'auto',
  display: 'block',
  objectFit: 'cover',
};

const detailsStyle: React.CSSProperties = {
  padding: '8px 4px',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '12px',
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: '10px 0 14px',
  color: '#0f172a',
  lineHeight: 1.15,
};

const descriptionStyle: React.CSSProperties = {
  margin: 0,
  color: '#475569',
  lineHeight: 1.7,
  fontSize: '15px',
};

const metaRowStyle: React.CSSProperties = {
  marginTop: '22px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  alignItems: 'center',
};

const priceStyle: React.CSSProperties = {
  margin: 0,
  color: '#0f172a',
};

const stockStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  borderRadius: '999px',
  background: '#e2f7ea',
  color: '#166534',
  padding: '8px 12px',
  fontSize: '14px',
  fontWeight: 600,
};

const buttonStyle: React.CSSProperties = {
  marginTop: '24px',
  border: 'none',
  borderRadius: '999px',
  background: '#0f172a',
  color: '#fff',
  padding: '12px 20px',
};
