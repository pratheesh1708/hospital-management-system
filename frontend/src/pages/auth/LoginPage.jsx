import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import GoogleAuthButton from '../../components/GoogleAuth/GoogleAuthButton';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success) {
        if (res.user.role === 'doctor') {
          navigate('/doctor/dashboard');
        } else if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      if (err.data?.requiresVerification) {
        navigate('/verify-otp', { state: { email, purpose: 'registration' } });
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.07), 0 0 0 1px #E2E8F0',
        padding: '40px',
        position: 'relative'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '16px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00A896, #028090)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 6px 14px rgba(0, 168, 150, 0.3)'
            }}>
              <Stethoscope size={24} />
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#0B132B', letterSpacing: '-0.5px' }}>
              St. Jude <span style={{ color: '#00A896', fontWeight: 400 }}>Hospital</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
            Sign In to Your Account
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Access clinical portals, appointments, and medical history.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FEE2E2',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#B91C1C'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <div style={{ marginBottom: '20px' }}>
          <GoogleAuthButton text="Continue with Google" mode="signin" />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '20px 0',
            color: '#94A3B8',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            <span style={{ padding: '0 12px', letterSpacing: '0.5px' }}>Or continue with email</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Password
              </label>
              <Link to="/forgot-password" style={{ fontSize: '12px', fontWeight: 600, color: '#00A896', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#00A896" />
            <span>Fast Demo Sign-In</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('patient@hospital.com', 'Password123!')}
              style={{
                padding: '8px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                background: '#F8FAFC',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2563EB',
                cursor: 'pointer'
              }}
            >
              👤 Patient
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('dr.arun@hospital.com', 'Password123!')}
              style={{
                padding: '8px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                background: '#F8FAFC',
                fontSize: '12px',
                fontWeight: 600,
                color: '#028090',
                cursor: 'pointer'
              }}
            >
              🩺 Doctor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@hospital.com', 'Password123!')}
              style={{
                padding: '8px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                background: '#F8FAFC',
                fontSize: '12px',
                fontWeight: 600,
                color: '#DB2777',
                cursor: 'pointer'
              }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', marginTop: '24px', marginBottom: 0 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#00A896', fontWeight: 700, textDecoration: 'none' }}>
            Register as Patient
          </Link>
        </p>
      </div>
    </div>
  );
}
