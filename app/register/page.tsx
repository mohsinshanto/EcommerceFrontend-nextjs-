// app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '../lib/api';

export default function Register() {
  const [error, setError] = useState(''); // store error message
  const [loading, setLoading] = useState(false); // loading state
  const router = useRouter();

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    // Client-side password validation
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

      // Axios response structure: res.data contains the server response
      if (res.status === 200 && res.data?.message) {
        // Optional: show a success message before redirecting
        alert(res.data.message); // "User registered successfully"
        router.push('/login'); // redirect to login
      } else {
        setError(res.data?.message || 'Registration failed');
      }
    } catch (err: any) {
      // Network or server error
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
      <input name="name" placeholder="Enter name" required />
      <input name="email" placeholder="Enter email" type="email" required />
      <input
        name="password"
        type="password"
        placeholder="Enter password (min 6 chars)"
        required
        minLength={6}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
