import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../supabaseClient';
import Spinner from '../components/ui/Spinner';

// Define the new Prism logo as a reusable component
const Logo: React.FC<{className?: string}> = ({ className }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8A5CF4" />
                <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
        </defs>
        <path d="M 50,10 L 90,80 L 10,80 Z" fill="url(#logoGradient)" />
    </svg>
);


const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('creator@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <Logo className="w-16 h-16" />
        </div>
        <h1 className="text-3xl font-bold text-center text-brand-text mb-2">Welcome Back to Prism</h1>
        <p className="text-center text-brand-text-muted mb-8">Log in to manage your creative world.</p>
        
        <div className="bg-brand-surface border border-brand-subtle rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Email Address" 
              id="email" 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required 
              disabled={loading}
            />
            <Input 
              label="Password" 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              disabled={loading}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full !py-3" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Log In'}
            </Button>
          </form>
        </div>
         <p className="text-center text-sm text-brand-muted mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand-primary hover:underline">
                Sign up
            </Link>
          </p>
      </div>
    </div>
  );
};

export default LoginPage;