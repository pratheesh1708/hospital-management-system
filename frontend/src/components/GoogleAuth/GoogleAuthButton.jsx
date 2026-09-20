import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function GoogleAuthButton({ text = 'Continue with Google', mode = 'signin' }) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [googleConfig, setGoogleConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkConfig() {
      try {
        const res = await authService.getGoogleConfig();
        if (res.success) {
          setGoogleConfig(res);
        }
      } catch (err) {
        // Fallback silently
      }
    }
    checkConfig();
  }, []);

  const handleGoogleClick = () => {
    // Redirect browser to backend OAuth endpoint which handles Google consent screen or zero-config demo
    window.location.href = '/api/auth/oauth/google';
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loading}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        padding: '11px 16px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#1E293B',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s ease',
        outline: 'none'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#F8FAFC';
        e.currentTarget.style.borderColor = '#94A3B8';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.borderColor = '#CBD5E1';
      }}
    >
      {/* Official Google 'G' Logo SVG */}
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
        />
      </svg>
      <span>{text}</span>
    </button>
  );
}
