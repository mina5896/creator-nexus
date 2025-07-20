
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';

interface SignupPageProps {
  onSignup: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup }) => {
  const { updateUser, user } = useAppContext();
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      bio: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would involve API calls for creation and validation.
    // Here we simulate it by updating the context and logging in.
    updateUser({
        ...user,
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
    });
    onSignup();
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
            <Button type="submit" className="w-full !py-3">
              Create Account
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
