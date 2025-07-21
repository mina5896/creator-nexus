import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Import supabase client
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { ICONS } from '../constants';

const CreateProjectPage: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGenerateConcept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError('Please enter your project idea.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Invoke the secure Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('create-project-concept', {
        body: { idea },
      });

      if (functionError) {
        throw new Error(functionError.message);
      }
      
      const { concept } = data;

      // Navigate to the concept board with the generated data
      navigate('/create/concept', { 
        state: { 
          concept
        } 
      });

    } catch (err: any) {
      const errorMessage = err.message.includes('Function returned a non-200 status code')
        ? "The AI Creative Director couldn't generate a concept. Please try a different idea."
        : err.message;
      setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const handleManualCreate = () => {
    // Navigate to the same concept page, but with no state
    navigate('/create/concept');
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Spinner size="lg" />
            <h2 className="mt-6 text-2xl font-semibold text-brand-text">Your AI Creative Director is working...</h2>
            <p className="mt-2 text-brand-text-muted">Analyzing your idea and crafting a vision.</p>
        </div>
    );
  }

  return (
    <div>
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-text flex items-center justify-center gap-3">
            {React.cloneElement(ICONS.sparkles, {className: "w-8 h-8 text-brand-secondary"})}
            Start with an Idea
        </h1>
        <p className="text-brand-text-muted mt-4 mb-8">Don't worry about the details. Just write down the spark of your next great project, and let the AI Creative Director help you build the concept.</p>
      </div>
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleGenerateConcept} className="space-y-6">
          <Textarea
            id="idea"
            label="Your Project Idea"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g., 'A moody, top-down detective game set in a floating city powered by whale song.' or 'An animated short about a lonely robot who finds a glowing seed.'"
            required
            rows={5}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end items-center pt-2 gap-4">
            {/* The new "Create Manually" button */}
            <Button type="button" variant="ghost" onClick={handleManualCreate}>
              Create Manually
            </Button>
            <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : "✨ Generate Concept"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateProjectPage;