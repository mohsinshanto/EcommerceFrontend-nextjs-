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
    <div style={{ padding: '40px', display: 'flex', gap: '40px' }}>
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

      <Image
        src={product.image_url}
        alt={product.name}
        width={400}
        height={300}
        style={{ borderRadius: '10px' }}
      />

      <div>
        <h1>{product.name}</h1>

        <p style={{ color: '#666' }}>{product.category}</p>

        <p style={{ marginTop: '10px' }}>{product.description}</p>

        <h2 style={{ marginTop: '20px' }}>${product.price.toFixed(2)}</h2>

        <p>Stock: {product.stock}</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button
          onClick={addToCart}
          disabled={product.stock === 0 || addingToCart}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            cursor:
              product.stock === 0 || addingToCart ? 'not-allowed' : 'pointer',
          }}
        >
          {addingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
