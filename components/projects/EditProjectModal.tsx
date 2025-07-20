import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Project } from '../../types';
import { CREATIVE_ROLES } from '../../constants';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    onSuccess: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ isOpen, onClose, project, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: project.title,
        description: project.description,
        isPublic: project.isPublic,
    });
    const [rolesNeeded, setRolesNeeded] = useState(project.rolesNeeded);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for the role selection dropdowns
    const [roleCategory, setRoleCategory] = useState(Object.keys(CREATIVE_ROLES)[0]);
    const [currentRole, setCurrentRole] = useState(CREATIVE_ROLES[roleCategory][0]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, isPublic: e.target.checked}));
    };

    const handleAddRole = () => { if (currentRole && !rolesNeeded.includes(currentRole)) { setRolesNeeded([...rolesNeeded, currentRole]); } };
    const handleRemoveRole = (roleToRemove: string) => { setRolesNeeded(rolesNeeded.filter(r => r !== roleToRemove)); };
    
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setRoleCategory(newCategory);
        setCurrentRole(CREATIVE_ROLES[newCategory][0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Update project details
        const { error: projectError } = await supabase
            .from('projects')
            .update({
                title: formData.title,
                description: formData.description,
                is_public: formData.isPublic,
            })
            .eq('id', project.id);

        if (projectError) {
            setError(projectError.message);
            setIsSubmitting(false);
            return;
        }

        // Sync roles: delete all existing and re-insert the current state
        const { error: deleteRolesError } = await supabase.from('project_roles_needed').delete().eq('project_id', project.id);
        if(deleteRolesError) { /* Handle error if needed */ }
        
        const rolesToInsert = rolesNeeded.map(role => ({ project_id: project.id, role_name: role }));
        const { error: insertRolesError } = await supabase.from('project_roles_needed').insert(rolesToInsert);

        if (insertRolesError) {
            setError(insertRolesError.message);
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        onSuccess(); // Refresh the data on the details page
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Project Title" name="title" value={formData.title} onChange={handleInputChange} required />
                <Textarea label="Project Description" name="description" value={formData.description} onChange={handleInputChange} rows={5} required />
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
                        {rolesNeeded.map(role => (
                            <span key={role} className="flex items-center bg-brand-subtle text-brand-text-muted px-3 py-1.5 rounded-full text-sm font-medium">
                                {role}
                                <button type="button" onClick={() => handleRemoveRole(role)} className="ml-2 text-brand-muted hover:text-brand-text">&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <input type="checkbox" id="isPublicEdit" checked={formData.isPublic} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                    <label htmlFor="isPublicEdit" className="text-sm text-brand-text-muted">Make project public on Discover page</label>
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProjectModal;
