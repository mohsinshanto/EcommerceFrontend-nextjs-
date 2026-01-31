// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to Ecommerce</h1>

      <nav>
        <Link href="/products">Products</Link>
        <br />
        <Link href="/login">Login</Link>
        <br />
        <Link href="/register">Register</Link>
      </nav>
    </main>
  );
}
