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
    location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link href="/">Ecommerce</Link>
      </div>

      <div className="nav-right">
        <Link href="/products">Products</Link>

        {isLoggedIn && <Link href="/cart">Cart</Link>}
        {isLoggedIn && <Link href="/orders">Orders</Link>}

        {!isLoggedIn ? (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </div>
    </nav>
  );
}
