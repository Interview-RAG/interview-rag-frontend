import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import AuthLayout, { AuthHeader, AuthField } from './AuthLayout';

export default function Signup({ showToast }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create your account — PrepAI';
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      showToast('Security code sent — check your inbox');
      setStep(2);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Could not create that account');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      showToast('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate('/collection');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'That code was not valid');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendOtp(email, password);
      showToast('New code sent');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Could not resend the code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout headline="Start the collection that gets you hired.">
      {step === 1 ? (
        <>
          <AuthHeader title="Create your account" sub="Two minutes, then start saving answers." />
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} autoComplete="off">
            <AuthField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="off"
            />
            <AuthField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minHeight: 48, marginTop: 8, justifyContent: 'space-between' }}
            >
              {loading ? 'Sending code…' : 'Create account'}
              <ArrowRight size={16} />
            </button>
          </form>
          <p className="text-muted" style={{ fontSize: 13, margin: '24px 0 0' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </>
      ) : (
        <>
          <AuthHeader title="Enter security code" sub={`We sent a 6-digit code to ${email}.`} />
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AuthField
              label="Security code"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              style={{
                minHeight: 46, padding: '10px 16px',
                fontFamily: 'var(--font-heading)', fontWeight: 800,
                fontSize: 22, letterSpacing: '.3em', textAlign: 'center',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || otp.length < 6}
              style={{ minHeight: 48, marginTop: 8, justifyContent: 'space-between' }}
            >
              {loading ? 'Verifying…' : 'Verify and continue'}
              <ArrowRight size={16} />
            </button>
          </form>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={handleResend} disabled={loading} style={{ fontSize: 13 }}>
              Resend code
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => { setStep(1); setOtp(''); }}
              style={{ fontSize: 13, marginLeft: 'auto', color: 'var(--color-text)', opacity: 0.7 }}
            >
              Use a different email
            </button>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
