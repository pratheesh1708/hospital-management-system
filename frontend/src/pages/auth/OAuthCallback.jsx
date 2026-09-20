import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function OAuthCallback() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function finalize() {
      await refreshUser();
      navigate('/patient/dashboard');
    }
    finalize();
  }, [navigate, refreshUser]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC'
    }}>
      <Sparkles size={36} color="#00A896" className="animate-spin" />
      <p style={{ marginTop: '16px', fontSize: '15px', fontWeight: 600, color: '#334155' }}>
        Authenticating session, please wait...
      </p>
    </div>
  );
}
