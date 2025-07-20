
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('creator@example.com');
  const [password, setPassword] = useState('password');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

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
            />
            <Input 
              label="Password" 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
            />
            <Button type="submit" className="w-full !py-3">
              Log In
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