import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Spinner from '../components/ui/Spinner';
import { CREATIVE_ROLES, ICONS } from '../constants';

interface ProjectConcept {
  title: string;
  description: string;
  rolesNeeded: string[];
}

const ConceptBoardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppContext();

  // The concept can now be undefined
  const { concept } = (location.state || {}) as { concept?: ProjectConcept };
  
  // Determine if this is the AI flow or manual flow
  const isAiFlow = !!concept;

  const [formData, setFormData] = useState({
      title: concept?.title || '',
      description: concept?.description || '',
      rolesNeeded: concept?.rolesNeeded || [],
      isPublic: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [roleCategory, setRoleCategory] = useState(Object.keys(CREATIVE_ROLES)[0]);
  const [currentRole, setCurrentRole] = useState(CREATIVE_ROLES[roleCategory][0]);

  // No longer need the useEffect to redirect, as this page now serves both purposes.

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleAddRole = () => { if (currentRole && !formData.rolesNeeded.includes(currentRole)) { setFormData(p => ({...p, rolesNeeded: [...p.rolesNeeded, currentRole]})) } };
  const handleRemoveRole = (roleToRemove: string) => { setFormData(p => ({...p, rolesNeeded: p.rolesNeeded.filter(r => r !== roleToRemove)})); };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setRoleCategory(newCategory);
    setCurrentRole(CREATIVE_ROLES[newCategory][0]);
  };
  
  const handleFinalizeProject = async () => {
    if (!user) {
        alert("You must be logged in to create a project.");
        return;
    }
    if (!formData.title.trim()) {
        alert("Project Title is required.");
        return;
    }
    setIsLoading(true);

    try {
        const { data: newProject, error: projectError } = await supabase
            .from('projects')
            .insert({
                owner_id: user.id,
                title: formData.title,
                description: formData.description,
                is_public: formData.isPublic,
                image_url: `https://picsum.photos/seed/${formData.title.replace(/\s/g, '-')}/1280/720`,
                status: 'planning',
                budget_total: 0,
                budget_spent: 0,
            })
            .select()
            .single();

        if (projectError) throw projectError;
        
        if (formData.rolesNeeded.length > 0) {
            const rolesToInsert = formData.rolesNeeded.map(role => ({
                project_id: newProject.id,
                role_name: role,
            }));
            const { error: rolesError } = await supabase.from('project_roles_needed').insert(rolesToInsert);
            if (rolesError) throw rolesError;
        }

        const { error: teamMemberError } = await supabase
            .from('project_team_members')
            .insert({
                project_id: newProject.id,
                user_id: user.id,
                role: 'Team Lead',
            });
        
        if (teamMemberError) throw teamMemberError;
        
        navigate(`/project/${newProject.id}`);
    } catch (error: any) {
        console.error("Error creating project:", error);
        alert(`Failed to create project: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-text flex items-center justify-center gap-3">
          {isAiFlow && React.cloneElement(ICONS.sparkles, {className: "w-8 h-8 text-brand-secondary"})}
          {isAiFlow ? 'Your Concept Board' : 'Create New Project'}
        </h1>
        <p className="text-brand-text-muted mt-4 mb-8">
            {isAiFlow 
                ? "The AI Creative Director has generated a concept based on your idea. Review and edit the details below, then finalize your project."
                : "Fill in the details for your new project to get started."
            }
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
            <Card>
                <div className="space-y-6">
                    <Input label="Project Title" name="title" value={formData.title} onChange={handleInputChange} required />
                    <Textarea label="Project Description" name="description" value={formData.description} onChange={handleInputChange} rows={6} />
                    <div>
                        <label className="block text-sm font-medium text-brand-text-muted mb-2">Roles Needed</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <select value={roleCategory} onChange={handleCategoryChange} className="w-full sm:w-1/3 bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary">
                              {Object.keys(CREATIVE_ROLES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                          <select value={currentRole} onChange={e => setCurrentRole(e.target.value)} className="w-full sm:w-1/3 bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary">
                              {CREATIVE_ROLES[roleCategory].map(role => <option key={role} value={role}>{role}</option>)}
                          </select>
                          <Button type="button" variant="secondary" onClick={handleAddRole} className="sm:w-auto">Add Role</Button>
                        </div>
                         <div className="flex flex-wrap gap-2 mt-4">
                            {formData.rolesNeeded.map(role => (
                                <span key={role} className="flex items-center bg-brand-subtle text-brand-text-muted px-3 py-1.5 rounded-full text-sm font-medium">
                                    {role}
                                    <button type="button" onClick={() => handleRemoveRole(role)} className="ml-2 text-brand-muted hover:text-brand-text">
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                     <div className="flex items-center space-x-3 pt-4">
                        <input 
                          type="checkbox" 
                          id="isPublic" 
                          checked={formData.isPublic} 
                          onChange={e => setFormData(p => ({...p, isPublic: e.target.checked}))}
                          className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" 
                        />
                        <label htmlFor="isPublic" className="text-sm text-brand-text-muted">
                          Make project public and visible on the Discover page
                        </label>
                      </div>
                </div>
            </Card>
      </div>
      
      <div className="mt-8 flex justify-center gap-4">
        {/* Only show the "Start Over" button if it was an AI flow */}
        {isAiFlow && (
            <Link to="/create-project">
                <Button variant="ghost" disabled={isLoading}>Start Over</Button>
            </Link>
        )}
        <Button size="lg" onClick={handleFinalizeProject} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : (isAiFlow ? 'Finalize Project' : 'Create Project')}
        </Button>
      </div>

    </div>
  );
};

export default ConceptBoardPage;