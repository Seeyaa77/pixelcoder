import { useMemo, useState } from 'react';
import {
  X,
  UserPlus,
  LogIn,
  KeyRound,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { loginUserBackend, registerUserBackend } from '../lib/supabase';
import { COMMON_PASSWORDS, passwordStrength, validatePassword } from '../lib/auth';

const STRENGTH_SEGMENTS = 4;

const LABELS = {
  en: {
    loginTitle: 'Player Login',
    registerTitle: 'Create Character',
    subtitle: 'Custom account system • public.pixelcoder_profiles',
    loginTab: 'Log In',
    registerTab: 'Register',
    usernameOrEmail: 'Username or Email',
    identifierPlaceholder: 'Username or email',
    username: 'Username',
    usernamePlaceholder: 'e.g. PixelHero',
    email: 'Email Address',
    emailPlaceholder: 'hero@quest.com',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    confirmPlaceholder: 'Repeat your password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    submitLogin: 'Enter The Arena',
    submitRegister: 'Create Character Profile',
    pending: 'Verifying...',
    strength: ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'],
    required: 'This field is required.',
    usernameRule: 'Use 3-20 letters, numbers, or underscores.',
    emailInvalid: 'Enter a valid email address.',
    passwordMin: 'Password must be at least 8 characters.',
    passwordSameAsUser: 'Password cannot be the same as your username.',
    passwordCommon: 'That password is too common. Choose something less guessable.',
    passwordMismatch: 'Passwords do not match.',
    loginMissing: 'Enter your username/email and password.',
    registerSuccess: 'Character created! Entering the arena...',
    loginSuccess: 'Welcome back!',
    footer: 'Scores, equipment, and progress save to your PixelCoder account.',
    noAuthService: 'Passwords are hashed in your browser before they are stored.',
  },
  id: {
    loginTitle: 'Login Pemain',
    registerTitle: 'Buat Karakter',
    subtitle: 'Sistem akun khusus • public.pixelcoder_profiles',
    loginTab: 'Masuk',
    registerTab: 'Daftar',
    usernameOrEmail: 'Username atau Email',
    identifierPlaceholder: 'Username atau email',
    username: 'Username',
    usernamePlaceholder: 'mis. PixelHero',
    email: 'Alamat Email',
    emailPlaceholder: 'hero@quest.com',
    password: 'Kata Sandi',
    confirmPassword: 'Konfirmasi Kata Sandi',
    confirmPlaceholder: 'Ulangi kata sandi',
    showPassword: 'Tampilkan kata sandi',
    hidePassword: 'Sembunyikan kata sandi',
    submitLogin: 'Masuk Arena',
    submitRegister: 'Buat Profil Karakter',
    pending: 'Memverifikasi...',
    strength: ['Terlalu lemah', 'Lemah', 'Cukup', 'Bagus', 'Kuat'],
    required: 'Kolom ini wajib diisi.',
    usernameRule: 'Gunakan 3-20 huruf, angka, atau garis bawah.',
    emailInvalid: 'Masukkan alamat email yang valid.',
    passwordMin: 'Kata sandi minimal 8 karakter.',
    passwordSameAsUser: 'Kata sandi tidak boleh sama dengan username.',
    passwordCommon: 'Kata sandi terlalu umum. Pilih yang lebih sulit ditebak.',
    passwordMismatch: 'Kata sandi tidak cocok.',
    loginMissing: 'Masukkan username/email dan kata sandi.',
    registerSuccess: 'Karakter dibuat! Masuk ke arena...',
    loginSuccess: 'Selamat datang kembali!',
    footer: 'Skor, perlengkapan, dan progres tersimpan di akun PixelCoder kamu.',
    noAuthService: 'Kata sandi di-hash di browser sebelum disimpan.',
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const STRENGTH_COLORS = ['#DC2626', '#F59E0B', '#F59E0B', '#7D8D39', '#16A34A'];

function FieldError({ message }) {
  if (!message) return null;
  return (
    <span className="text-[10px] text-[#991B1B] flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </span>
  );
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  language = 'en',
}) {
  // The form lives in a child so closing the modal unmounts it. That resets
  // every field (including passwords) without a setState-in-effect.
  if (!isOpen) return null;

  return (
    <AuthModalForm
      onClose={onClose}
      onAuthSuccess={onAuthSuccess}
      initialMode={initialMode}
      language={language}
    />
  );
}

function AuthModalForm({ onClose, onAuthSuccess, initialMode = 'login', language = 'en' }) {
  const [mode, setMode] = useState(initialMode);
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const t = useMemo(() => LABELS[language] || LABELS.en, [language]);
  const strength = useMemo(() => passwordStrength(password), [password]);

  const validateForm = () => {
    const errors = {};

    if (mode === 'register') {
      const cleanUsername = username.trim();
      if (!cleanUsername) {
        errors.username = t.required;
      } else if (!USERNAME_PATTERN.test(cleanUsername)) {
        errors.username = t.usernameRule;
      }

      const cleanEmail = email.trim();
      if (!cleanEmail) {
        errors.email = t.required;
      } else if (!EMAIL_PATTERN.test(cleanEmail)) {
        errors.email = t.emailInvalid;
      }

      if (!password) {
        errors.password = t.required;
      } else if (password.length < 8) {
        errors.password = t.passwordMin;
      } else if (password.toLowerCase() === cleanUsername.toLowerCase()) {
        errors.password = t.passwordSameAsUser;
      } else if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
        errors.password = t.passwordCommon;
      } else {
        const passwordCheck = validatePassword(password, cleanUsername);
        if (!passwordCheck.valid) errors.password = passwordCheck.message;
      }

      if (!confirmPassword) {
        errors.confirmPassword = t.required;
      } else if (confirmPassword !== password) {
        errors.confirmPassword = t.passwordMismatch;
      }
    } else {
      if (!identifier.trim()) errors.identifier = t.required;
      if (!password) errors.password = t.required;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    if (mode === 'register') {
      const res = await registerUserBackend(username.trim(), email.trim(), password);
      if (res.success) {
        // No artificial delay: hand the session straight to the app.
        onAuthSuccess(res.user);
        onClose();
        return;
      }
      setErrorMsg(res.error || 'Registration failed.');
    } else {
      const res = await loginUserBackend(identifier.trim(), password);
      if (res.success) {
        onAuthSuccess(res.user);
        onClose();
        return;
      }
      setErrorMsg(res.error || 'Login failed. Check your credentials.');
    }

    setIsLoading(false);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorMsg('');
    setFieldErrors({});
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
                {mode === 'login' ? t.loginTitle : t.registerTitle}
              </h2>
              <p className="text-[11px] font-mono opacity-90">{t.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 bg-white text-[#1E2522] border-2 border-[#1E2522] flex items-center justify-center font-bold hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="bg-[#F3F6F4] px-4 pt-3 flex gap-2 border-b-3 border-[#1E2522]">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase border-t-2 border-l-2 border-r-2 border-[#1E2522] ${
              mode === 'login' ? 'bg-white -mb-[3px] border-b-0 text-[#1E2522]' : 'bg-gray-200 text-gray-600'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 inline mr-1" /> {t.loginTab}
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase border-t-2 border-l-2 border-r-2 border-[#1E2522] ${
              mode === 'register' ? 'bg-white -mb-[3px] border-b-0 text-[#1E2522]' : 'bg-gray-200 text-gray-600'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 inline mr-1" /> {t.registerTab}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 font-mono text-xs" noValidate>
          {errorMsg && (
            <div className="p-2.5 bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Identifier for Login (Username or Email) */}
          {mode === 'login' ? (
            <div className="flex flex-col gap-1">
              <label htmlFor="auth-identifier" className="font-bold uppercase text-[#1E2522]">
                {t.usernameOrEmail}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  id="auth-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t.identifierPlaceholder}
                  autoComplete="username"
                  required
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.identifier)}
                  className="w-full neo-input pl-9"
                />
              </div>
              <FieldError message={fieldErrors.identifier} />
            </div>
          ) : (
            <>
              {/* Username for Register */}
              <div className="flex flex-col gap-1">
                <label htmlFor="auth-username" className="font-bold uppercase text-[#1E2522]">
                  {t.username}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t.usernamePlaceholder}
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    aria-invalid={Boolean(fieldErrors.username)}
                    className="w-full neo-input pl-9"
                  />
                </div>
                <FieldError message={fieldErrors.username} />
              </div>

              {/* Email for Register */}
              <div className="flex flex-col gap-1">
                <label htmlFor="auth-email" className="font-bold uppercase text-[#1E2522]">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    autoComplete="email"
                    required
                    disabled={isLoading}
                    aria-invalid={Boolean(fieldErrors.email)}
                    className="w-full neo-input pl-9"
                  />
                </div>
                <FieldError message={fieldErrors.email} />
              </div>
            </>
          )}

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label htmlFor="auth-password" className="font-bold uppercase text-[#1E2522]">
              {t.password}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                disabled={isLoading}
                aria-invalid={Boolean(fieldErrors.password)}
                className="w-full neo-input pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                title={showPassword ? t.hidePassword : t.showPassword}
                className="absolute right-2 top-1.5 w-7 h-7 flex items-center justify-center text-gray-500 hover:text-[#1E2522]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <FieldError message={fieldErrors.password} />

            {mode === 'register' && password.length > 0 && (
              <div className="flex items-center gap-2 mt-1" aria-live="polite">
                <div className="flex gap-1 flex-1">
                  {Array.from({ length: STRENGTH_SEGMENTS }).map((_, index) => (
                    <span
                      key={index}
                      className="h-1.5 flex-1 border border-[#1E2522]"
                      style={{
                        backgroundColor: index < strength ? STRENGTH_COLORS[strength] : '#E5E7EB',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold" style={{ color: STRENGTH_COLORS[strength] }}>
                  {t.strength[strength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password (register only) */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="auth-confirm-password" className="font-bold uppercase text-[#1E2522]">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  id="auth-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPlaceholder}
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  className="w-full neo-input pl-9"
                />
              </div>
              <FieldError message={fieldErrors.confirmPassword} />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="neo-button py-2.5 mt-2 bg-[#7D8D39] hover:bg-[#8fa042] text-white flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span>{t.pending}</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t.submitLogin}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t.submitRegister}</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-500 text-center">{t.footer}</p>
          <p className="text-[10px] text-gray-400 text-center">{t.noAuthService}</p>
        </form>
      </div>
    </div>
  );
}
