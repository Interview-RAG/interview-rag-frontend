import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, ShieldCheck, Brain, MessageSquare, FileText, Zap } from 'lucide-react';

const Signup = ({ showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { signUp, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password);
      showToast('Verification code sent! Check your email.');
      setStep(2);
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Signup failed';
      showToast(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(email, otp, password);
      showToast('Account verified! You are now logged in.');
      navigate('/collection');
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Verification failed';
      showToast(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await resendOtp(email, password);
      showToast('A new verification code has been sent to your email.');
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Resend failed';
      showToast(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel - Branding + 3D */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <BookOpen size={36} />
            <span>InterviewRAG</span>
          </div>
          <h1 className="auth-tagline">Your AI-Powered<br />Interview Coach</h1>
          <p className="auth-subtitle">
            Build your personal knowledge base, practice with an intelligent AI assistant, and ace your next interview.
          </p>

          {/* 3D Floating Cards */}
          <div className="auth-3d-scene">
            <div className="auth-float-card auth-float-card-1">
              <Brain size={22} />
              <div>
                <strong>Smart Q&A</strong>
                <span>AI-powered deduplication</span>
              </div>
            </div>
            <div className="auth-float-card auth-float-card-2">
              <MessageSquare size={22} />
              <div>
                <strong>AI Chat Agent</strong>
                <span>RAG + Web search</span>
              </div>
            </div>
            <div className="auth-float-card auth-float-card-3">
              <FileText size={22} />
              <div>
                <strong>PDF Upload</strong>
                <span>Auto-extract Q&A pairs</span>
              </div>
            </div>
            <div className="auth-float-card auth-float-card-4">
              <Zap size={22} />
              <div>
                <strong>Export & Study</strong>
                <span>Download as PDF</span>
              </div>
            </div>
            <div className="auth-3d-orb"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {step === 1 ? (
            <>
              <div className="auth-form-header">
                <h2>Create your account</h2>
                <p>Start building your interview knowledge base</p>
              </div>

              <form onSubmit={handleSignup} className="auth-form">
                <div className="auth-input-group">
                  <Mail size={18} className="auth-input-icon" />
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    className="auth-input"
                    placeholder=" "
                  />
                  <label htmlFor="signup-email" className="auth-float-label">Email address</label>
                </div>

                <div className="auth-input-group">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="auth-input"
                    placeholder=" "
                  />
                  <label htmlFor="signup-password" className="auth-float-label">Password (min 6 characters)</label>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-footer">
                <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
              </div>
            </>
          ) : (
            <>
              <div className="auth-form-header">
                <div className="auth-otp-icon">
                  <ShieldCheck size={48} />
                </div>
                <h2>Verify your email</h2>
                <p>We sent a 6-digit code to <strong>{email}</strong></p>
              </div>

              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="auth-input-group">
                  <ShieldCheck size={18} className="auth-input-icon" />
                  <input
                    id="signup-otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="auth-input auth-otp-input"
                    placeholder=" "
                  />
                  <label htmlFor="signup-otp" className="auth-float-label">Enter 6-digit code</label>
                </div>

                <button type="submit" disabled={loading} className="auth-submit-btn">
                  {loading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      Verify & Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="auth-resend-btn"
                >
                  Didn't receive the code? Resend
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
