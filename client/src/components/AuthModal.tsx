import React, { useState, useEffect } from 'react';
import { signIn, signUp } from '../lib/auth-client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultView = 'signin' }) => {
  const [view, setView] = useState<'signin' | 'signup'>(defaultView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. Force the modal to always open on the 'signin' view
  useEffect(() => {
    if (isOpen) {
      setView('signin');
    }
  }, [isOpen]);

  // 2. Custom close handler to wipe all typed data
  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setView('signin');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (view === 'signup') {
        const { error } = await signUp.email({ email, password, name });
        if (error) setError(error.message || 'An error occurred.');
        else handleClose(); // Use our new close handler here too
      } else {
        const { error } = await signIn.email({ email, password });
        if (error) setError(error.message || 'Invalid email or password.');
        else handleClose(); // And here
      }
    } catch (err: any) {
      console.error("Fatal network error:", err);
      setError('Network error: Could not reach the server.');
    } finally {
      setLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    // 3. Removed the onClick handler from the backdrop so clicking outside does nothing
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all">
      
      {/* The Glassmorphic Card */}
      <div className="w-full max-w-md p-10 rounded-3xl bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button - Now calls handleClose instead of onClose */}
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="mb-8 text-center mt-2">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
            {view === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-sm">
            {view === 'signup' ? 'Join us and get started today.' : 'Enter your credentials to access your account.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
              <input 
                type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required 
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
            <input 
              type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <input 
              type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required 
              className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>

          {error && <p className="text-sm text-red-400 text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}

          <button 
            type="submit" disabled={loading}
            className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? 'Processing...' : (view === 'signup' ? 'Sign Up' : 'Log In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => {
              setView(view === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {view === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;