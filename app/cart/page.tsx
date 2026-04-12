'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { apiRequest } from '../lib/api';

type CartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
  };
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  // update cart item quantity
  const updateQuantity = async (cartId: number, quantity: number) => {
    try {
      await apiRequest(`/cart/${cartId}`, 'PUT', {
        quantity,
      });

      fetchCart(); // refresh UI
    } catch (err: any) {
      console.log(err.response?.data); // 👈 IMPORTANT
      alert(err.response?.data?.error || 'Failed to update quantity');
    }
  };
  // ✅ Fetch cart
  const fetchCart = async () => {
    try {
      const res = await apiRequest('/cart');
      setCart(res.data.cart || []);
    } catch (err) {
      console.error('Failed to load cart');
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

      alert('Order placed successfully');

      // redirect to orders page
      window.location.href = '/orders';
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to place order');
    }
  };
  // ✅ Remove item
  const removeItem = async (id: number) => {
    try {
      await apiRequest(`/cart/${id}`, 'DELETE');
      fetchCart(); // refresh
    } catch {
      alert('Failed to remove item');
    }
  };

  // ✅ Total calculation
  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) return <p>Loading cart...</p>;

  if (cart.length === 0)
    return <p style={{ textAlign: 'center' }}>Cart is empty</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Your Cart</h2>

      {cart.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #ddd',
            padding: '15px 0',
          }}
        >
          {/* LEFT: Image + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Image */}
            <Image
              src={item.product.image_url}
              alt={item.product.name}
              width={100}
              height={80}
              style={{
                objectFit: 'cover',
                borderRadius: '5px',
              }}
            />

            {/* Info */}
            <div>
              <h4 style={{ margin: '0 0 5px 0' }}>{item.product.name}</h4>
              <p style={{ margin: '2px 0' }}>Price: {item.product.price} BDT</p>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  style={{
                    padding: '4px 10px',
                    cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    padding: '4px 10px',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
              <p style={{ margin: '2px 0' }}>
                Subtotal: {item.product.price * item.quantity} BDT
              </p>
            </div>
          </div>

          {/* RIGHT: Remove Button */}
          <button
            onClick={() => removeItem(item.id)}
            style={{
              padding: '6px 12px',
              background: 'red',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <div
        style={{
          marginTop: '20px',
          textAlign: 'right',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        Total: ${total.toFixed(2)}
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button
          onClick={placeOrder}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'green',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
