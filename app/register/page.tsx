'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { apiRequest } from '../lib/api';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/register', 'POST', {
        name,
        email,
        password,
      });

      if (res.status === 200 && res.data?.message) {
        router.push('/login');
      } else {
        setError(res.data?.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
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
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Register</h2>

        <input
          name="name"
          placeholder="Enter name"
          required
          style={inputStyle}
        />

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
            minLength={6}
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
          {loading ? 'Registering...' : 'Register'}
        </button>
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
