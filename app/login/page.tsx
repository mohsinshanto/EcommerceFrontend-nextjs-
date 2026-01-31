// app/login/page.tsx
'use client';
import { apiRequest } from '../lib/api';

export default function Login() {
  const submit = async (e: any) => {
    e.preventDefault();
    const form = e.target;

    const res = await apiRequest('/login', 'POST', {
      email: form.email.value,
      password: form.password.value,
    });

    localStorage.setItem('token', res.token);
  };

  return (
    <form onSubmit={submit}>
      <input name="email" />
      <input name="password" type="password" />
      <button>Login</button>
    </form>
  );
}
