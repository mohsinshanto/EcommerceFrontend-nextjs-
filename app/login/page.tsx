// app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';

export default function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/login', 'POST', { email, password });

      if (res.status === 200 && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        router.push('/products'); // redirect to products page
      } else {
        setError(res.data?.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '300px',
      }}
    >
      <input name="email" placeholder="Enter email" type="email" required />
      <input
        name="password"
        type="password"
        placeholder="Enter password"
        required
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
