import React, { useState } from 'react';
import { X, UserPlus, LogIn, KeyRound, Mail, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { loginUserBackend, registerUserBackend } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync mode with prop when opened
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'register') {
      if (!username || !email || !password) {
        setErrorMsg('Please fill in all fields!');
        setIsLoading(false);
        return;
      }

      const res = await registerUserBackend(username, email, password);
      if (res.success) {
        setSuccessMsg('Character registered successfully in Supabase! Welcome, ' + username);
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.error || 'Registration failed.');
      }
    } else {
      if (!identifier || !password) {
        setErrorMsg('Please enter username/email and password!');
        setIsLoading(false);
        return;
      }

      const res = await loginUserBackend(identifier, password);
      if (res.success) {
        setSuccessMsg('Authentication verified! Welcome back, ' + res.user.username);
        setTimeout(() => {
          onAuthSuccess(res.user);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Login failed. Check your credentials.');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white border-4 border-[#1E2522] shadow-[8px_8px_0px_#1E2522] overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#7D8D39] text-white p-4 flex items-center justify-between border-b-4 border-[#1E2522]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#FDE047]" />
            <div>
              <h2 className="font-extrabold text-lg uppercase tracking-tight">
                {mode === 'login' ? 'Player Authentication' : 'Character Registration'}
              </h2>
              <p className="text-[11px] font-mono opacity-90">
                Connected to live PostgreSQL Supabase Auth
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 bg-white text-[#1E2522] border-2 border-[#1E2522] flex items-center justify-center font-bold hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="bg-[#F3F6F4] px-4 pt-3 flex gap-2 border-b-3 border-[#1E2522]">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase border-t-2 border-l-2 border-r-2 border-[#1E2522] ${
              mode === 'login' ? 'bg-white -mb-[3px] border-b-0 text-[#1E2522]' : 'bg-gray-200 text-gray-600'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 inline mr-1" /> Log In
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase border-t-2 border-l-2 border-r-2 border-[#1E2522] ${
              mode === 'register' ? 'bg-white -mb-[3px] border-b-0 text-[#1E2522]' : 'bg-gray-200 text-gray-600'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 font-mono text-xs">
          
          {errorMsg && (
            <div className="p-2.5 bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-[#DCFCE7] border-2 border-[#16A34A] text-[#166534] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Identifier for Login (Username or Email) */}
          {mode === 'login' ? (
            <div className="flex flex-col gap-1">
              <label className="font-bold uppercase text-[#1E2522]">Username or Email</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Username or email"
                  required
                  className="w-full neo-input pl-9"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Username for Register */}
              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase text-[#1E2522]">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. PixelHero"
                    required
                    className="w-full neo-input pl-9"
                  />
                </div>
              </div>

              {/* Email for Register */}
              <div className="flex flex-col gap-1">
                <label className="font-bold uppercase text-[#1E2522]">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hero@quest.com"
                    required
                    className="w-full neo-input pl-9"
                  />
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="font-bold uppercase text-[#1E2522]">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full neo-input pl-9"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="neo-button py-2.5 mt-2 bg-[#7D8D39] hover:bg-[#8fa042] text-white flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Connecting to Supabase...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Enter The Arena</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Character Profile</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-500 text-center">
            Zero dummy data. All scores, equipment, and levels save to public.pixelcoder_profiles!
          </p>

        </form>

      </div>
    </div>
  );
}
