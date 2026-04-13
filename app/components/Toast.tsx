'use client';

import { useEffect } from 'react';

type ToastProps = {
  open: boolean;
  message: string;
  variant?: 'success' | 'error';
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
};

export default function Toast({
  open,
  message,
  variant = 'success',
  onClose,
  actionLabel,
  onAction,
}: ToastProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onClose();
    }, 2800);

    return () => window.clearTimeout(timeout);
  }, [open, onClose]);

  if (!open || !message) {
    return null;
  }

  const isSuccess = variant === 'success';

  return (
    <div style={toastWrapStyle}>
      <div
        style={{
          ...toastStyle,
          borderColor: isSuccess ? '#1f8f5f' : '#c83a3a',
        }}
      >
        <div>
          <p style={titleStyle}>{isSuccess ? 'Success' : 'Something went wrong'}</p>
          <p style={messageStyle}>{message}</p>
        </div>

        <div style={actionsStyle}>
          {actionLabel && onAction && (
            <button onClick={onAction} style={actionButtonStyle}>
              {actionLabel}
            </button>
          )}

          <button onClick={onClose} aria-label="Close toast" style={closeButtonStyle}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const toastWrapStyle: React.CSSProperties = {
  position: 'fixed',
  top: '84px',
  right: '20px',
  zIndex: 1000,
};

const toastStyle: React.CSSProperties = {
  minWidth: '280px',
  maxWidth: '360px',
  background: '#fff',
  border: '1px solid #d6d6d6',
  borderLeftWidth: '6px',
  borderRadius: '14px',
  boxShadow: '0 18px 40px rgba(17, 24, 39, 0.16)',
  padding: '16px 16px 14px',
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: '#4b5563',
};

const messageStyle: React.CSSProperties = {
  margin: '6px 0 0',
  fontSize: '15px',
  color: '#111827',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '14px',
};

const actionButtonStyle: React.CSSProperties = {
  border: 'none',
  background: '#111827',
  color: '#fff',
  borderRadius: '999px',
  padding: '8px 12px',
  cursor: 'pointer',
};

const closeButtonStyle: React.CSSProperties = {
  border: 'none',
  background: '#eef2f7',
  color: '#334155',
  borderRadius: '999px',
  padding: '8px 12px',
  cursor: 'pointer',
};
