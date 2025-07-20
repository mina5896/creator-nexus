import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { supabase } from '../supabaseClient';
import Spinner from '../components/ui/Spinner';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            bio: formData.bio,
            avatar_url: `https://i.pravatar.cc/150?u=${formData.email}`
          }
        }
      });
      if (error) throw error;
      alert('Success! Please check your email for a confirmation link to complete your signup.');
      navigate('/login'); // Redirect to login page after signup
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl"></div>
        </div>
        <h1 className="text-3xl font-bold text-center text-brand-text mb-2">Create Your Account</h1>
        <p className="text-center text-brand-text-muted mb-8">Join the Creator's Nexus community.</p>
        
        <div className="bg-brand-surface border border-brand-subtle rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Full Name" 
              id="name" 
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required 
            />
             <Input 
              label="Email Address" 
              id="email" 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required 
            />
            <Input 
              label="Password" 
              id="password" 
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••" 
              required
            />
            <Textarea
              label="Your Bio"
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a little about your creative passion."
            />
             {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full !py-3" disabled={loading}>
               {loading ? <Spinner size="sm" /> : 'Create Account'}
            </Button>
          </form>
        </div>
         <p className="text-center text-sm text-brand-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-primary hover:underline">
                Log In
            </Link>
          </p>
      </div>
    </div>
  );
};

export default SignupPage;
