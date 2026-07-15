import React, { useState } from 'react';
import { Mail, Lock, Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const displayFont = { fontFamily: "'Fraunces', serif" };
const bodyFont = { fontFamily: "'Public Sans', sans-serif" };

const Signup = ({ showToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      showToast("Account created successfully!");
      navigate('/collection');
    } catch (err) {
      showToast("Failed to create account");
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
            <div className="w-8 h-8 rounded-[8px] bg-[#1F6E4A] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span style={displayFont} className="text-white text-[18px] font-semibold">
              InterviewRAG
            </span>
          </div>

          <h1 style={displayFont} className="text-white text-5xl leading-[1.1] font-medium max-w-md">
            Start your journey. <span className="text-[#A6A399]">Nail the offer.</span>
          </h1>
          <p style={bodyFont} className="text-[#A6A399] text-[15px] leading-relaxed mt-6 max-w-sm">
            Build a personal knowledge base of your experiences and let our AI coach you to perfection.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
           <div className="flex -space-x-2">
             <div className="w-8 h-8 rounded-full border-2 border-[#17170F] bg-[#1F6E4A]"></div>
             <div className="w-8 h-8 rounded-full border-2 border-[#17170F] bg-[#E7E5DF]"></div>
             <div className="w-8 h-8 rounded-full border-2 border-[#17170F] bg-[#C97A2B]"></div>
           </div>
           <span style={bodyFont} className="text-[#6E6C63] text-[12px] font-medium">Join 2,000+ candidates</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-[8px] bg-[#1F6E4A] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span style={displayFont} className="text-[#17170F] text-[18px] font-semibold">
              InterviewRAG
            </span>
          </div>

          <div className="mb-8">
            <h2 style={displayFont} className="text-[#17170F] text-[28px] font-semibold mb-2">
              Create an account
            </h2>
            <p style={bodyFont} className="text-[#6E6C63] text-[14px]">
              It takes less than a minute.
            </p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
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
                  style={bodyFont}
                  className="w-full bg-[#FAFAF8] border border-[#E7E5DF] rounded-[8px] pl-10 pr-3.5 py-3 text-[14px] text-[#17170F] placeholder:text-[#A6A399] outline-none focus:border-[#1F6E4A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label style={bodyFont} className="text-[#17170F] text-[12.5px] font-semibold mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6A399]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <p style={bodyFont} className="text-center text-[#6E6C63] text-[13px] mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[#17170F] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
