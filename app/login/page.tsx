'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { apiRequest, getErrorMessage } from '../lib/api';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const email = form.email.value.trim().toLowerCase();
    const password = form.password.value;

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest<{ token: string }>('/login', 'POST', {
        email,
        password,
      });

      if (res.token) {
        localStorage.setItem('token', res.token);
        router.push('/products');
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '50vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          width: '320px',
          padding: '30px',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Login</h2>

        <input
          name="email"
          placeholder="Enter email"
          type="email"
          required
          style={inputStyle}
        />

        {/* Password Field with Eye Toggle */}
        <div style={{ position: 'relative' }}>
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            required
            style={{ ...inputStyle, paddingRight: '40px' }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={iconButtonStyle}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>

        {error && (
          <p style={{ color: 'red', fontSize: '14px', margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div style={switchTextStyle}>
          <span>New here?</span>{' '}
          <Link href="/register" style={switchLinkStyle}>
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}

/* ---------- Reusable Styles ---------- */

const inputStyle: React.CSSProperties = {
  padding: '10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  outline: 'none',
};

const iconButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const switchTextStyle: React.CSSProperties = {
  marginTop: '4px',
  textAlign: 'center',
  color: '#475569',
  fontSize: '14px',
};

const switchLinkStyle: React.CSSProperties = {
  color: '#0f172a',
  fontWeight: 600,
  textDecoration: 'none',
};
