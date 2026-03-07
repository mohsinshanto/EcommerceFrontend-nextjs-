'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiRequest('/products');
        setProducts(res.data.products ?? []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (productId: number) => {
    try {
      await apiRequest('/cart', 'POST', {
        product_id: productId,
        quantity: 1,
      });
      alert('Added to cart');
    } catch {
      alert('Failed to add to cart');
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        padding: '20px',
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

          <img
            src={`http://localhost:8080${p.image_url}`}
            alt={p.name}
            height={150}
            width={200}
            style={{ objectFit: 'cover', borderRadius: '5px' }}
          />

          <p>{p.description.slice(0, 50)}...</p>
          <p>Price: {p.price} BDT</p>
          <p>Stock: {p.stock}</p>

          <button
            disabled={p.stock === 0}
            onClick={() => addToCart(p.id)}
            style={{
              marginTop: 'auto',
              padding: '8px 15px',
              cursor: 'pointer',
            }}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
