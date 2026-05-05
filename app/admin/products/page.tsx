// app/admin/products/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { apiRequest, getErrorMessage } from '../../lib/api';

export default function AdminProducts() {
  const [count, setCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProductCount = async () => {
    try {
      setError('');
      setLoadingCount(true);
      const response = await apiRequest<{ count: number }>('/products/count');
      setCount(response.count);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load product count'));
    } finally {
      setLoadingCount(false);
    }
  };

  useEffect(() => {
    loadProductCount();
  }, []);

  const create = async () => {
    try {
      setMessage('');
      setError('');
      await apiRequest('/products', 'POST', {
        name: 'New Product',
        description: 'Temporary admin-created product',
        price: 100,
        stock: 1,
        image_url: '/products/macbook.jpg',
        category: 'laptop',
      });
      await loadProductCount();
      setMessage('Product created successfully.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create product'));
    }
  };

  return (
    <div>
      <p>
        Total products:{' '}
        {loadingCount ? 'Loading...' : count !== null ? count : 'Unavailable'}
      </p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <button onClick={create}>Create Product</button>
    </div>
  );
}
