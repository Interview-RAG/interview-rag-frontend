import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPasswordModal({ isOpen, onClose, showToast }) {
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState(1); // 1: email, 2: code + new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const close = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setError('');
    onClose();
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not send a reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      showToast?.('Password reset — sign in with your new one');
      close();
    } catch (err) {
      setError(err.response?.data?.detail || 'That code was not valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="dialog-backdrop"
      onClick={close}
      style={{
        zIndex: 150,
        background: 'color-mix(in srgb, var(--color-neutral-900) 40%, transparent)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(420px, 100%)', borderRadius: 28, padding: 32,
          background: 'var(--color-bg)', gap: 0, animation: 'rise .3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 24, letterSpacing: '-.025em', margin: '0 0 6px' }}>
              {step === 1 ? 'Reset your password' : 'Enter security code'}
            </h3>
            <p className="text-muted" style={{ fontSize: 13.5, margin: '0 0 24px' }}>
              {step === 1
                ? 'We will email you a 6-digit code.'
                : `Sent to ${email}. Enter it with your new password.`}
            </p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={close}
            style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', color: 'var(--color-text)' }}
          >
            <X size={16} />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ minHeight: 46, padding: '10px 16px' }}
              />
            </div>
            {error && <p style={{ color: 'var(--color-accent)', fontSize: 13, margin: 0 }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minHeight: 48, marginTop: 4 }}>
              {loading ? 'Sending…' : 'Send code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>Security code</label>
              <input
                className="input"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                style={{
                  minHeight: 46, padding: '10px 16px',
                  fontFamily: 'var(--font-heading)', fontWeight: 800,
                  fontSize: 22, letterSpacing: '.3em', textAlign: 'center',
                }}
              />
            </div>
            <div className="field">
              <label>New password</label>
              <input
                className="input"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{ minHeight: 46, padding: '10px 16px' }}
              />
            </div>
            {error && <p style={{ color: 'var(--color-accent)', fontSize: 13, margin: 0 }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minHeight: 48, marginTop: 4 }}>
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setStep(1); setError(''); }}
              style={{ fontSize: 13 }}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
