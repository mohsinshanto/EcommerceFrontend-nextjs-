'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={leftStyle}>
          <Link href="/" style={brandStyle}>
            Ecommerce
          </Link>
        </div>

        <div style={rightStyle}>
          <Link href="/products">Products</Link>

          {isLoggedIn && <Link href="/cart">Cart</Link>}
          {isLoggedIn && <Link href="/orders">Orders</Link>}

          {!isLoggedIn ? (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          ) : (
            <button onClick={logout} style={logoutStyle}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ---------- Styles ---------- */

const navStyle: React.CSSProperties = {
  width: '100%',
  borderBottom: '1px solid #ddd',
  padding: '15px 0',
  backgroundColor: '#fff',
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1100px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 20px',
};

const leftStyle: React.CSSProperties = {
  fontWeight: 'bold',
  fontSize: '18px',
};

const brandStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: '#000',
};

const rightStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  alignItems: 'center',
};

const logoutStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
};
