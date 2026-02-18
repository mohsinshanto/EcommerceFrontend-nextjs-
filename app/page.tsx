'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Welcome to Ecommerce</h1>

        <p style={subtitleStyle}>
          Discover quality products at the best prices.
        </p>

        <Link href="/products" style={buttonStyle}>
          Browse Products
        </Link>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const wrapperStyle: React.CSSProperties = {
  minHeight: '80vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const containerStyle: React.CSSProperties = {
  textAlign: 'center',
  maxWidth: '800px',
  padding: '20px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '32px',
  marginBottom: '15px',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '16px',
  marginBottom: '25px',
  color: '#555',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: '1px solid #000',
  textDecoration: 'none',
  borderRadius: '4px',
};
