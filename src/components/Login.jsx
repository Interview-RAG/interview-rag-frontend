import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, Sparkles, Brain, Search, MessageSquare, FileText, Zap } from 'lucide-react';

const Login = ({ showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      showToast('Logged in successfully!');
      navigate('/collection');
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Login failed';
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
            {/* Glowing orb behind cards */}
            <div className="auth-3d-orb"></div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue your interview prep</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-input-group">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder=" "
              />
              <label htmlFor="login-email" className="auth-float-label">Email address</label>
            </div>

            <div className="auth-input-group">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
                placeholder=" "
              />
              <label htmlFor="login-password" className="auth-float-label">Password</label>
            </div>

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/signup" className="auth-link">Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
