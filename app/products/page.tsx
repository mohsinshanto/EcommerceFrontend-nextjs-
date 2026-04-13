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
  const [lastPage, setLastPage] = useState(1);

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
          last_page: number;
        }>(url);

        setProducts(res.products ?? []);
        setLastPage(res.last_page || 1);
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
            onClick={() => router.push(`/products/${p.id}`)}
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
              cursor: 'pointer',
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
            <p>Price: ${p.price.toFixed(2)}</p>
            <p>Stock: {p.stock}</p>

            <button
              disabled={p.stock === 0 || addingProductId === p.id}
              onClick={(e) => {
                e.stopPropagation();
                addToCart(p.id);
              }}
              style={{
                marginTop: 'auto',
                padding: '8px 15px',
                cursor:
                  p.stock === 0 || addingProductId === p.id
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              {addingProductId === p.id ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          style={{
            marginRight: '10px',
            cursor: page === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Prev
        </button>

        <span>
          Page {page} of {lastPage}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
          disabled={page === lastPage}
          style={{
            marginLeft: '10px',
            cursor: page === lastPage ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
