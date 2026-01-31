// app/register/page.tsx
'use client';

import { apiRequest } from '../lib/api';

export default function Register() {
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    await apiRequest('/register', 'POST', {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
  };

  return (
    <form onSubmit={submit}>
      <input name="name" placeholder="Enter name" />
      <input name="email" placeholder="Enter email" />
      <input name="password" type="password" placeholder="Enter password" />
      <button type="submit">Register</button>
    </form>
  );
}
