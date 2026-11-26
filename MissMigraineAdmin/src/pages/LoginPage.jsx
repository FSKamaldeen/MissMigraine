import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message || 'Unable to sign in.');
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand/10 to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-elevated rounded-3xl p-8 shadow-2xl relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="font-reem text-4xl text-text-primary mb-2">
            MissMigraine
          </h1>
          <p className="font-plein text-text-muted">
            Administrator Portal
          </p>
        </div>

        <form onSubmit={handleSignIn} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-2">
            <label className="font-plein text-sm text-text-secondary ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[54px] rounded-2xl bg-elevated px-5 font-plein text-base text-text-primary placeholder-brand/50 focus:outline-none focus:ring-2 focus:ring-brand transition-all"
              placeholder="admin@missmigraine.com"
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-plein text-sm text-text-secondary ml-1">Password</label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[54px] rounded-2xl bg-elevated pl-5 pr-12 font-plein text-base text-text-primary placeholder-brand/50 focus:outline-none focus:ring-2 focus:ring-brand transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                disabled={loading}
              />
              
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand hover:text-brand-light transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="font-plein text-sm text-danger bg-danger/10 border border-danger/30 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 w-full h-[54px] rounded-full font-plein-medium text-lg transition-colors flex items-center justify-center ${
              loading
                ? 'bg-wisteria-700 text-wisteria-300 cursor-not-allowed'
                : 'bg-brand hover:bg-brand-light text-background'
            }`}
          >
            {loading ? 'Verifying…' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  );
}