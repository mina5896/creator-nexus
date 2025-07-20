import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../supabaseClient';
import Spinner from '../components/ui/Spinner';
import { useAppContext } from '../contexts/AppContext';

const LoginPage: React.FC = () => {
  const { session } = useAppContext();
  const [email, setEmail] = useState('creator@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      // NOTE: Navigation is now handled automatically by the router
      // when the session state changes. We don't need to navigate here.
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // If a session is detected, redirect to the dashboard.
  // This prevents a logged-in user from seeing the login page.
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl"></div>
        </div>
        <h1 className="text-3xl font-bold text-center text-brand-text mb-2">Welcome Back</h1>
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

