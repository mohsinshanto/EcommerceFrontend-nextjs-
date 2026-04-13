'use client';

import { useRouter } from 'next/navigation';

type AuthRequiredProps = {
  message?: string;
};

export default function AuthRequired({
  message = 'Please log in to continue.',
}: AuthRequiredProps) {
  const router = useRouter();

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <p style={eyebrowStyle}>Account Required</p>
        <h2 style={titleStyle}>You need to sign in first</h2>
        <p style={messageStyle}>{message}</p>
        <button onClick={() => router.push('/login')} style={buttonStyle}>
          Go to Login
        </button>
      </div>
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  minHeight: '55vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const cardStyle: React.CSSProperties = {
  maxWidth: '460px',
  width: '100%',
  padding: '32px',
  borderRadius: '18px',
  border: '1px solid #e5e7eb',
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  textAlign: 'center',
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '12px',
  fontWeight: 700,
};

const titleStyle: React.CSSProperties = {
  margin: '10px 0 12px',
  color: '#0f172a',
};

const messageStyle: React.CSSProperties = {
  margin: '0 0 20px',
  color: '#475569',
  lineHeight: 1.6,
};

const buttonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '999px',
  background: '#0f172a',
  color: '#fff',
  padding: '11px 18px',
  cursor: 'pointer',
};
