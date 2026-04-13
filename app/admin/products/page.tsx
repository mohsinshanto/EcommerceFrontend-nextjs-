// app/admin/products/page.tsx
'use client';
import { useState } from 'react';
import { apiRequest, getErrorMessage } from '../../lib/api';

export default function AdminProducts() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      setMessage('Product created successfully.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create product'));
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <button onClick={create}>Create Product</button>
    </div>
  );
}
