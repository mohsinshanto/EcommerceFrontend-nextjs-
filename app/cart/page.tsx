// app/cart/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    apiRequest('/cart').then(setCart);
  }, []);

  const remove = async (id: number) => {
    await apiRequest(`/cart/${id}`, 'DELETE');
  };

  return (
    <div>
      {cart.map((c: any) => (
        <div key={c.id}>
          {c.productName}
          <button onClick={() => remove(c.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
