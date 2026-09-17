import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import AuthLayout, { AuthHeader, AuthField } from './AuthLayout';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function Login({ showToast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign in — PrepAI';
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/collection');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthLayout headline="Your answers, ready when it counts.">
        <AuthHeader title="Welcome back" sub="Sign in to continue your prep." />

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} autoComplete="off">
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
            placeholder="••••••••"
            autoComplete="new-password"
            action={
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '0 2px' }}
              >
                Forgot password?
              </button>
            }
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ minHeight: 48, marginTop: 8, justifyContent: 'space-between' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-muted" style={{ fontSize: 13, margin: '24px 0 0' }}>
          Don&apos;t have an account? <Link to="/signup">Create one</Link>
        </p>
      </AuthLayout>

      <ForgotPasswordModal isOpen={showForgot} onClose={() => setShowForgot(false)} showToast={showToast} />
    </>
  );
}
