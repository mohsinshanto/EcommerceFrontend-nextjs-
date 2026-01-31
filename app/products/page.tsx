// app/products/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiRequest('/products').then(setProducts);
  }, []);

  return (
    <ul>
      {products.map((p: any) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
