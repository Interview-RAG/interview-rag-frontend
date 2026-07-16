import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, X, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const displayFont = { fontFamily: "'Fraunces', serif" };
const bodyFont = { fontFamily: "'Public Sans', sans-serif" };

export default function ForgotPasswordModal({ isOpen, onClose, showToast }) {
  const { forgotPassword, resetPassword } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      showToast("Reset code sent to your email!");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      showToast("Password successfully reset! Please log in.");
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={handleClose}
      />
      
      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-[#1F6E4A] px-6 py-8 relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 border border-white/20">
            <KeyRound size={24} className="text-white" />
          </div>
          <h2 style={displayFont} className="text-white text-[24px] font-semibold leading-tight">
            {step === 1 ? 'Reset your password' : 'Enter security code'}
          </h2>
          <p style={bodyFont} className="text-white/80 text-[14px] mt-1">
            {step === 1 
              ? "Enter your email and we'll send you a verification code." 
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {error && (
            <div className="bg-[#D97757]/10 text-[#D97757] text-[13px] px-4 py-3 rounded-[8px] mb-4 border border-[#D97757]/20 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div>
                <label style={bodyFont} className="text-[#17170F] text-[12.5px] font-semibold mb-1.5 block">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6A399]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={bodyFont}
                    className="w-full bg-[#FAFAF8] border border-[#E7E5DF] rounded-[8px] pl-10 pr-3.5 py-3 text-[14px] text-[#17170F] placeholder:text-[#A6A399] outline-none focus:border-[#1F6E4A] transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                style={bodyFont}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-[#1F6E4A] text-white text-[14px] font-semibold rounded-[8px] py-3.5 transition-all duration-150 active:scale-[0.98] hover:bg-[#195C3D] disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div>
                <label style={bodyFont} className="text-[#17170F] text-[12.5px] font-semibold mb-1.5 block">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  style={bodyFont}
                  className="w-full bg-[#FAFAF8] border border-[#E7E5DF] rounded-[8px] px-3.5 py-3 text-[16px] tracking-[4px] text-center font-bold text-[#1F6E4A] placeholder:text-[#A6A399]/50 outline-none focus:border-[#1F6E4A] transition-colors"
                />
              </div>
              <div>
                <label style={bodyFont} className="text-[#17170F] text-[12.5px] font-semibold mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6A399]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    style={bodyFont}
                    className="w-full bg-[#FAFAF8] border border-[#E7E5DF] rounded-[8px] pl-10 pr-3.5 py-3 text-[14px] text-[#17170F] placeholder:text-[#A6A399] outline-none focus:border-[#1F6E4A] transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6 || newPassword.length < 6}
                style={bodyFont}
                className="mt-2 w-full flex items-center justify-center gap-2 bg-[#1F6E4A] text-white text-[14px] font-semibold rounded-[8px] py-3.5 transition-all duration-150 active:scale-[0.98] hover:bg-[#195C3D] disabled:opacity-70 disabled:active:scale-100"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm New Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
