// app/admin/products/page.tsx
'use client';
import { apiRequest } from '../../lib/api';

export default function AdminProducts() {
  const create = async () => {
    await apiRequest('/products', 'POST', {
      name: 'New Product',
      price: 100,
    });
  };

  return <button onClick={create}>Create Product</button>;
}
