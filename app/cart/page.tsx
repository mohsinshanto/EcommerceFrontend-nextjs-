'use client';

import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

type CartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
};

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await apiRequest('/cart');
      setCart(Array.isArray(res.data.cart) ? res.data.cart : []);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setCart([]); // empty cart
      } else {
        console.error('Fetch cart failed:', err);
        setCart([]); // safety fallback
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const placeOrder = async () => {
    try {
      const res = await apiRequest('/order', 'POST');
      alert(
        `Order #${res.data.order_id} placed. Total Paid: ${res.data.totalPaid} BDT`
      );
      setCart([]);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to place order');
    }
  };

  const remove = async (id: number) => {
    try {
      await apiRequest(`/cart/${id}`, 'DELETE');
      setCart((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) {
    return <p>Loading cart...</p>;
  }

  return (
    <div>
      <h2>Your Cart</h2>

      {cart.length === 0 && <p>Cart is empty</p>}

      {cart.map((c) => (
        <div key={c.id}>
          <p>
            {c.product.name} — {c.quantity} × {c.product.price} BDT
          </p>
          <button onClick={() => remove(c.id)}>Remove</button>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <h3>Total: {total} BDT</h3>
          <button onClick={placeOrder}>Place Order</button>
        </>
      )}
    </div>
  );
}
