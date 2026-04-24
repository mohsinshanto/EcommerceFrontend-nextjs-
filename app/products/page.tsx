'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  apiRequest,
  getAuthMessage,
  getErrorMessage,
  isAuthError,
} from '../lib/api';
import { useRouter } from 'next/navigation';
import Toast from '../components/Toast';
import AuthRequired from '../components/AuthRequired';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
};

export default function Products() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    variant: 'success' | 'error';
  }>({
    open: false,
    message: '',
    variant: 'success',
  });

  // filters
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState(''); // ✅ only used for API
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // ✅ fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setAuthMessage('');
        setError('');

        let url = `/products?page=${page}`;

        if (appliedSearch.trim()) url += `&search=${appliedSearch}`;
        if (category) url += `&category=${category}`;

        const res = await apiRequest<{
          products: Product[];
          has_next: boolean;
          has_prev: boolean;
        }>(url);

        setProducts(res.products ?? []);
        setHasNext(Boolean(res.has_next));
        setHasPrev(Boolean(res.has_prev));
      } catch (err) {
        if (isAuthError(err)) {
          setAuthMessage(getAuthMessage(err));
          setProducts([]);
          return;
        }

        setError(getErrorMessage(err, 'Failed to load products'));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [appliedSearch, category, page]);

  const handleSearch = () => {
    setPage(1);
    setAppliedSearch(search); // ✅ trigger API
  };

  const addToCart = async (productId: number) => {
    try {
      setError('');
      setAddingProductId(productId);
      await apiRequest('/cart', 'POST', {
        product_id: productId,
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
        message: getErrorMessage(err, 'Failed to add to cart'),
        variant: 'error',
      });
    } finally {
      setAddingProductId(null);
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (authMessage) return <AuthRequired message={authMessage} />;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
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

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search for anything"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            paddingLeft: '80px',
            paddingRight: '20px',
            paddingTop: '10px',
            paddingBottom: '10px',
            width: '200px',
            marginRight: '10px',
            borderRadius: '20px',
          }}
        />

        <button
          onClick={handleSearch}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
            background: '#3665f3',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
          }}
        >
          Search
        </button>
      </div>

      <div style={{ marginBottom: '15px', textAlign: 'center' }}>
        <button
          onClick={() => {
            setCategory('');
            setPage(1);
            setAppliedSearch('');
          }}
          style={{
            padding: '5px 20px',
          }}
        >
          All
        </button>
        <button
          onClick={() => {
            setCategory('mobile');
            setPage(1);
            setAppliedSearch('');
          }}
          style={{
            padding: '5px 20px',
          }}
        >
          Mobile
        </button>
        <button
          onClick={() => {
            setCategory('laptop');
            setPage(1);
            setAppliedSearch('');
          }}
          style={{
            padding: '5px 20px',
          }}
        >
          Laptop
        </button>
        <button
          onClick={() => {
            setCategory('audio');
            setPage(1);
            setAppliedSearch('');
          }}
          style={{
            padding: '5px 20px',
          }}
        >
          Audio
        </button>
        <button
          onClick={() => {
            setCategory('accessories');
            setPage(1);
            setAppliedSearch('');
          }}
          style={{
            padding: '5px 20px',
          }}
        >
          Accessories
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          justifyContent: 'center',
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '15px',
              width: '250px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <h3>{p.name}</h3>

            <Image
              src={p.image_url}
              alt={p.name}
              width={200}
              height={150}
              style={{ objectFit: 'cover', borderRadius: '5px' }}
            />

            <p>{p.description.slice(0, 50)}...</p>
            <p>
              <b>Category:</b> {p.category}
            </p>
            <p>Price: {p.price.toFixed(2)} BDT</p>
            <p>Stock: {p.stock}</p>

            <div
              style={{
                marginTop: 'auto',
                display: 'flex',
                gap: '10px',
                width: '100%',
              }}
            >
              <button
                onClick={() => {
                  router.push(`/products/${p.id}`);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '999px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                View Details
              </button>

              <button
                disabled={p.stock === 0 || addingProductId === p.id}
                onClick={() => {
                  addToCart(p.id);
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  cursor:
                    p.stock === 0 || addingProductId === p.id
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    p.stock === 0 || addingProductId === p.id ? 0.7 : 1,
                }}
              >
                {addingProductId === p.id ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={!hasPrev}
          style={{
            marginRight: '10px',
            cursor: !hasPrev ? 'not-allowed' : 'pointer',
          }}
        >
          Prev
        </button>

        <span>Page {page}</span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext}
          style={{
            marginLeft: '10px',
            cursor: !hasNext ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
