import React, { useState, useEffect } from 'react';
import { Mail, Lock, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import FeatureShowcase from './FeatureShowcase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const displayFont = { fontFamily: "'Fraunces', serif" };
const bodyFont = { fontFamily: "'Public Sans', sans-serif" };

const Login = ({ showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    document.title = "PrepAI";
  }, []);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/collection');
    } catch (err) {
      showToast("Invalid credentials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#FAFAF8]">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex flex-1 bg-[#17170F] flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle decorative background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #1F6E4A 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)' }}></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-[8px] overflow-hidden shrink-0">
              <img src="/favicon.png" alt="PrepAI" className="w-full h-full object-cover" />
            </div>
            <span style={displayFont} className="text-white text-[18px] font-semibold">
              PrepAI
            </span>
          </div>

          <h1 style={displayFont} className="text-white text-4xl leading-[1.1] font-medium max-w-md">
            Master your narrative. <br/><span className="text-[#A6A399]">Own the interview.</span>
          </h1>

          {/* Interactive Feature Showcase */}
          <FeatureShowcase />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-[8px] overflow-hidden shrink-0">
              <img src="/favicon.png" alt="PrepAI" className="w-full h-full object-cover" />
            </div>
            <span style={displayFont} className="text-[#17170F] text-[18px] font-semibold">
              PrepAI
            </span>
          </div>

          <div className="mb-8">
            <h2 style={displayFont} className="text-[#17170F] text-[28px] font-semibold mb-2">
              Welcome back
            </h2>
            <p style={bodyFont} className="text-[#6E6C63] text-[14px]">
              Sign in to continue your preparation.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4" autoComplete="off">
            <div>
              <label style={bodyFont} className="text-[#17170F] text-[12.5px] font-semibold mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6A399]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="off"
                  style={bodyFont}
                  className="w-full bg-[#FAFAF8] border border-[#E7E5DF] rounded-[8px] pl-10 pr-3.5 py-3 text-[14px] text-[#17170F] placeholder:text-[#A6A399] outline-none focus:border-[#1F6E4A] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={bodyFont} className="text-[#17170F] text-[12.5px] font-semibold">
                  Password
                </label>
                <Link to="/login" style={bodyFont} className="text-[#1F6E4A] text-[12px] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6A399]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={bodyFont}
                  className="w-full bg-[#FAFAF8] border border-[#E7E5DF] rounded-[8px] pl-10 pr-10 py-3 text-[14px] text-[#17170F] placeholder:text-[#A6A399] outline-none focus:border-[#1F6E4A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A6A399] hover:text-[#6E6C63] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={bodyFont}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-[#1F6E4A] text-white text-[14px] font-semibold rounded-[8px] py-3.5 transition-all duration-150 active:scale-[0.98] hover:bg-[#195C3D] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign in'}
            </button>
          </form>

          <p style={bodyFont} className="text-center text-[#6E6C63] text-[13px] mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#17170F] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
