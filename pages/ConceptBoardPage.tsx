import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { ProjectConcept } from '../services/geminiService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { CREATIVE_ROLES, ICONS } from '../constants';

const ConceptBoardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addProject } = useAppContext();

  // The state passed from the previous page
  const { concept, conceptArt } = (location.state || {}) as { concept: ProjectConcept | undefined; conceptArt: string | undefined };
  
  const [formData, setFormData] = useState({
      title: concept?.title || '',
      description: concept?.description || '',
      rolesNeeded: concept?.rolesNeeded || [],
      isPublic: true
  });
  
  const [roleCategory, setRoleCategory] = useState(Object.keys(CREATIVE_ROLES)[0]);
  const [currentRole, setCurrentRole] = useState(CREATIVE_ROLES[roleCategory][0]);

  // If the user navigates here directly, the state will be missing. Redirect them.
  useEffect(() => {
    if (!concept || !conceptArt) {
      navigate('/create-project');
    }
  }, [concept, conceptArt, navigate]);

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
  
  const handleFinalizeProject = () => {
    addProject({
        ...formData,
        imageUrl: `data:image/jpeg;base64,${conceptArt}`,
    });
    alert('Project created successfully!');
    navigate('/dashboard');
  };

  if (!concept || !conceptArt) {
    // Render nothing while redirecting
    return null;
  }

  return (
    <div>
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-brand-text flex items-center justify-center gap-3">
          {React.cloneElement(ICONS.sparkles, {className: "w-8 h-8 text-brand-secondary"})}
          Your Concept Board
        </h1>
        <p className="text-brand-text-muted mt-4 mb-8">
            The AI Creative Director has generated a concept based on your idea. Review and edit the details below, then finalize your project to bring it to life.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <Card>
                <div className="space-y-6">
                    <Input label="Project Title" name="title" value={formData.title} onChange={handleInputChange} />
                    <Textarea label="Project Description" name="description" value={formData.description} onChange={handleInputChange} rows={6} />
                    <div>
                        <label className="block text-sm font-medium text-brand-text-muted mb-2">Initial Roles Needed</label>
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
        <div className="lg:col-span-2">
            <Card>
                <h3 className="text-lg font-semibold text-brand-text mb-3">AI-Generated Concept Art</h3>
                <div className="aspect-video bg-brand-background rounded-lg overflow-hidden">
                    <img src={`data:image/jpeg;base64,${conceptArt}`} alt="AI-generated concept art" className="w-full h-full object-cover" />
                </div>
            </Card>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center gap-4">
        <Link to="/create-project">
            <Button variant="ghost">Start Over</Button>
        </Link>
        <Button size="lg" onClick={handleFinalizeProject}>
            Finalize and Create Project
        </Button>
      </div>

    </div>
  );
};

export default ConceptBoardPage;