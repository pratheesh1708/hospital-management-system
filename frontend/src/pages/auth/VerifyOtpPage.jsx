import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { Stethoscope, ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function VerifyOtpPage() {
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setError('Please provide your email and the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await verifyEmail(email, otp.trim());
      if (res.success) {
        navigate('/patient/dashboard');
      } else {
        setError(res.message || 'Verification failed. Please verify your OTP.');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;
    try {
      setResending(true);
      setError('');
      const res = await authService.resendOtp(email, location.state?.purpose || 'registration');
      if (res.success) {
        setInfo('A new verification code has been dispatched to your email.');
        setTimer(60);
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError(err.message || 'Error resending OTP.');
    } finally {
      setResending(false);
    }
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
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00A896, #028090)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '16px',
            boxShadow: '0 6px 16px rgba(0, 168, 150, 0.3)'
          }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
            Verify Your Email
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Enter the 6-digit security code sent to <strong>{email || 'your email'}</strong>.
          </p>
        </div>

        {info && (
          <div style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#1E40AF'
          }}>
            {info}
          </div>
        )}

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

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {!location.state?.email && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="name@example.com"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              required
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="form-control"
              style={{
                textAlign: 'center',
                fontSize: '24px',
                letterSpacing: '8px',
                fontWeight: 700,
                color: '#0F172A'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={handleResend}
            disabled={timer > 0 || resending}
            style={{
              background: 'none',
              border: 'none',
              color: timer > 0 ? '#94A3B8' : '#00A896',
              fontSize: '13px',
              fontWeight: 600,
              cursor: timer > 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            <span>{timer > 0 ? `Resend Code in ${timer}s` : 'Resend Verification Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
