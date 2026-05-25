'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div style={wrapperStyle}>Loading payment result...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}

function PaymentResultContent() {
  const params = useSearchParams();
  const status = params.get('status') || 'failed';
  const orderId = params.get('order_id');
  const transactionId = params.get('transaction_id');
  const message = params.get('message');

  const normalizedStatus =
    status === 'success' || status === 'cancelled' ? status : 'failed';

  const content =
    normalizedStatus === 'success'
      ? {
          title: 'Payment completed',
          body: message || 'Your SSLCommerz sandbox payment was validated successfully.',
          accent: '#166534',
          background: '#dcfce7',
        }
      : normalizedStatus === 'cancelled'
        ? {
            title: 'Payment cancelled',
            body: message || 'You cancelled the payment before it was completed.',
            accent: '#92400e',
            background: '#fef3c7',
          }
        : {
            title: 'Payment failed',
            body: message || 'The payment could not be completed. You can try again from checkout.',
            accent: '#b91c1c',
            background: '#fee2e2',
          };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <div
          style={{
            ...badgeStyle,
            color: content.accent,
            background: content.background,
          }}
        >
          {normalizedStatus.toUpperCase()}
        </div>

        <h1 style={titleStyle}>{content.title}</h1>
        <p style={messageStyle}>{content.body}</p>

        {orderId && (
          <p style={metaStyle}>
            <strong>Order ID:</strong> {orderId}
          </p>
        )}

        {transactionId && (
          <p style={metaStyle}>
            <strong>Transaction ID:</strong> {transactionId}
          </p>
        )}

        <div style={actionsStyle}>
          <Link href="/orders" style={primaryLinkStyle}>
            View Orders
          </Link>
          <Link href="/checkout" style={secondaryLinkStyle}>
            Back to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  minHeight: '70vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '560px',
  borderRadius: '22px',
  border: '1px solid #e2e8f0',
  background: '#fff',
  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
  padding: '32px',
  textAlign: 'center',
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  borderRadius: '999px',
  padding: '6px 12px',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
};

const titleStyle: React.CSSProperties = {
  margin: '16px 0 10px',
  color: '#0f172a',
};

const messageStyle: React.CSSProperties = {
  margin: '0 auto 18px',
  color: '#475569',
  lineHeight: 1.6,
  maxWidth: '420px',
};

const metaStyle: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#334155',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '12px',
  marginTop: '24px',
};

const primaryLinkStyle: React.CSSProperties = {
  borderRadius: '999px',
  background: '#0f172a',
  color: '#fff',
  padding: '12px 18px',
  textDecoration: 'none',
};

const secondaryLinkStyle: React.CSSProperties = {
  borderRadius: '999px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  padding: '12px 18px',
  textDecoration: 'none',
};
