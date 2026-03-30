'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { apiRequest } from '../../lib/api';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
};

export default function ProductDetails() {
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiRequest(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div style={{ padding: '40px', display: 'flex', gap: '40px' }}>
      {/* Image */}
      <Image
        src={product.image_url}
        alt={product.name}
        width={400}
        height={300}
        style={{ borderRadius: '10px' }}
      />

      {/* Details */}
      <div>
        <h1>{product.name}</h1>

        <p style={{ color: '#666' }}>{product.category}</p>

        <p style={{ marginTop: '10px' }}>{product.description}</p>

        <h2 style={{ marginTop: '20px' }}>${product.price.toFixed(2)}</h2>

        <p>Stock: {product.stock}</p>

        <button
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
