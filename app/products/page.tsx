// app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiRequest('/products');
        setProducts(res.data.products);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load products');
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
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>
          <h3>{p.name}</h3>
          <p>{p.description}</p>
          <p>Price: {p.price} BDT</p>
          <p>Stock: {p.stock}</p>

          <button disabled={p.stock === 0} onClick={() => addToCart(p.id)}>
            Add to Cart
          </button>
        </li>
      ))}
    </ul>
  );
}
