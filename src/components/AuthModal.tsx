import React, { useState } from 'react';
import { X, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { email, password }
        : { email, name: fullName, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || 'Authentication failed');
        setIsSubmitting(false);
        return;
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setErrorMessage('Network error during authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'twitter') => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const names = {
        google: 'Dr. Sarah Alston, MD',
        apple: 'Dr. Elena Rostova',
        twitter: 'Dr. Maya Lin, FACOG'
      };
      const emails = {
        google: 'sarah.alston@gynewell.community',
        apple: 'elena.rostova@icloud.com',
        twitter: 'maya.lin@clinic.com'
      };

      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: emails[provider],
          name: names[provider],
          avatar: provider === 'google' ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=260' : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (e) {
      setErrorMessage('Failed to connect via social provider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSwitch = async (role: 'admin' | 'customer') => {
    const targetEmail = role === 'admin' ? 'admin@gynewell.clinic' : 'claire.watson@gmail.com';
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, password: 'password123' })
    });
    const data = await res.json();
    if (data.success) {
      onLoginSuccess(data.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf8f5] border border-[#ebe6de] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-[#ebe6de] flex items-center justify-between bg-[#f4efe9]">
          <div className="flex items-center space-x-2.5">
            <img
              src="/assets/aistudio/GyneWell_dp_1d15eb01.png"
              alt="GyneWell"
              className="w-7 h-7 object-contain"
            />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#3b4349]">
                {mode === 'login' ? 'GyneWell Clinician Sign In' : 'Register Clinical Account'}
              </h3>
              <p className="text-[10px] text-[#717977]">Care You Trust, Wellness You Deserve</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#717977] hover:text-[#3b4349] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Switchers Banner */}
        <div className="p-4 bg-[#7ea8a4]/10 border-b border-[#7ea8a4]/20 space-y-2">
          <p className="text-[11px] font-bold text-[#3b4349] uppercase tracking-wider">
            Quick 1-Click Persona Access:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickSwitch('admin')}
              className="py-1.5 px-2 bg-[#3b4349] text-white text-[11px] font-bold rounded-lg flex items-center justify-center space-x-1 shadow-2xs hover:bg-[#2a3035]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7ea8a4]" />
              <span>Master Admin (Dr. Oluremi)</span>
            </button>
            <button
              onClick={() => handleQuickSwitch('customer')}
              className="py-1.5 px-2 bg-white text-[#3b4349] text-[11px] font-bold rounded-lg border border-[#ddd7cd] hover:bg-[#f4efe9]"
            >
              <span>Customer Account</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {/* Social Sign In Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full py-2.5 px-3 bg-white hover:bg-[#f4efe9] border border-[#ddd7cd] rounded-lg text-xs font-semibold text-[#3b4349] flex items-center justify-center space-x-2 shadow-2xs transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google Account</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                className="py-2 px-3 bg-white hover:bg-[#f4efe9] border border-[#ddd7cd] rounded-lg text-xs font-semibold text-[#3b4349] flex items-center justify-center space-x-1.5"
              >
                <span> Apple ID</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('twitter')}
                className="py-2 px-3 bg-white hover:bg-[#f4efe9] border border-[#ddd7cd] rounded-lg text-xs font-semibold text-[#3b4349] flex items-center justify-center space-x-1.5"
              >
                <span>𝕏 Twitter</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#ebe6de]"></div>
            <span className="flex-shrink mx-3 text-[11px] uppercase font-bold text-[#717977]">Or with email</span>
            <div className="flex-grow border-t border-[#ebe6de]"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-semibold text-[#3b4349] mb-1">Clinician Full Name & Degree</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Rebecca Vance, MD"
                  className="w-full p-2.5 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#3b4349] mb-1">Clinical Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@clinic.org"
                className="w-full p-2.5 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349]"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3b4349] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-white border border-[#ddd7cd] rounded-lg text-[#3b4349]"
                required
              />
            </div>

            {errorMessage && (
              <div className="text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#7ea8a4] hover:bg-[#6d9793] text-white font-bold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to GyneWell' : 'Create Clinician Account'}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="text-center pt-2 text-xs text-[#575f66]">
            {mode === 'login' ? (
              <span>
                New to GyneWell?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-[#7ea8a4] hover:underline"
                >
                  Register Clinical Account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#7ea8a4] hover:underline"
                >
                  Sign In
                </button>
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
