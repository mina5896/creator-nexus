import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { CREATIVE_ROLES, AVATARS } from '../constants';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    skills: user.skills,
    compensationType: user.compensationType,
    hourlyRate: user.hourlyRate || 0,
  });
  
  const [avatarSelectionType, setAvatarSelectionType] = useState<'upload' | 'select'>('select');
  const [roleCategory, setRoleCategory] = useState(Object.keys(CREATIVE_ROLES)[0]);
  const [currentRole, setCurrentRole] = useState(CREATIVE_ROLES[roleCategory][0]);

  const handleToggleEdit = (editing: boolean) => {
    setIsEditing(editing);
    if (editing) {
      setFormData({
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        skills: user.skills,
        compensationType: user.compensationType,
        hourlyRate: user.hourlyRate || 0,
      });
      const userSkillsCategory = Object.keys(CREATIVE_ROLES).find(cat => CREATIVE_ROLES[cat].some(skill => user.skills.includes(skill))) || Object.keys(CREATIVE_ROLES)[0];
      setRoleCategory(userSkillsCategory);
      setCurrentRole(CREATIVE_ROLES[userSkillsCategory][0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: objectUrl }));
    }
  };

  const handleAddSkill = () => {
    if (currentRole && !formData.skills.includes(currentRole)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, currentRole] }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setRoleCategory(newCategory);
    setCurrentRole(CREATIVE_ROLES[newCategory][0]);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      ...user,
      name: formData.name,
      bio: formData.bio,
      avatarUrl: formData.avatarUrl,
      skills: formData.skills,
      compensationType: formData.compensationType,
      hourlyRate: formData.compensationType === 'paid' ? formData.hourlyRate : undefined,
    });
    handleToggleEdit(false);
    alert('Profile updated successfully!');
  };

  const CompensationDisplay = () => {
    if (user.compensationType === 'paid') {
        return <span className="text-lg font-semibold text-green-400">${user.hourlyRate}/hr</span>
    }
    return <span className="text-lg font-semibold text-purple-400">Open to Experience</span>
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-8">My Profile</h1>
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0 text-center w-full md:w-48">
              <img src={formData.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt="User avatar" className="w-40 h-40 rounded-full mx-auto border-4 border-brand-primary object-cover" />
              {isEditing && (
                <div className="mt-4">
                  <div className="flex rounded-md bg-brand-subtle p-1 space-x-1 mb-4">
                    <button type="button" onClick={() => setAvatarSelectionType('select')} className={`w-full px-3 py-1.5 text-sm font-medium rounded transition-colors ${avatarSelectionType === 'select' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-muted hover:bg-brand-surface'}`}>Select Avatar</button>
                    <button type="button" onClick={() => setAvatarSelectionType('upload')} className={`w-full px-3 py-1.5 text-sm font-medium rounded transition-colors ${avatarSelectionType === 'upload' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-muted hover:bg-brand-surface'}`}>Upload</button>
                  </div>
                  {avatarSelectionType === 'upload' ? (
                     <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-brand-subtle rounded-md text-sm font-medium text-brand-text bg-brand-surface hover:bg-brand-subtle">
                        <span>Choose Photo</span><input id="file-upload" type="file" className="sr-only" onChange={handleAvatarFileChange} accept="image/*" />
                    </label>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {AVATARS.map(avatar => (
                            <img key={avatar} src={avatar} alt="Avatar option" onClick={() => setFormData(p => ({...p, avatarUrl: avatar}))} className={`w-12 h-12 rounded-full cursor-pointer transition-all border-2 ${formData.avatarUrl === avatar ? 'border-brand-primary scale-110' : 'border-transparent hover:border-brand-primary/50'}`} />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex-grow w-full">
              {!isEditing ? (
                <>
                  <div className="flex justify-between items-start">
                    <h2 className="text-3xl font-bold text-brand-text">{user.name}</h2>
                    <CompensationDisplay />
                  </div>
                  <p className="text-brand-text-muted mt-4">{user.bio}</p>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-brand-text mb-2">Key Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map(skill => (
                        <span key={skill} className="bg-brand-secondary/20 text-brand-secondary px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                      ))}
                      {user.skills.length === 0 && <p className="text-sm text-brand-text-muted">No skills added yet.</p>}
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                      <Button onClick={() => handleToggleEdit(true)}>Edit Profile</Button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <Input label="Full Name" name="name" value={formData.name} onChange={handleInputChange} required />
                  <Textarea label="Bio" name="bio" value={formData.bio} onChange={handleInputChange} required />
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-text-muted mb-2">Compensation Preference</label>
                    <div className="space-y-2">
                        <div className="flex items-center">
                           <input type="radio" id="comp-experience" name="compensationType" value="experience" checked={formData.compensationType === 'experience'} onChange={() => setFormData(p => ({...p, compensationType: 'experience'}))} className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-brand-subtle" />
                           <label htmlFor="comp-experience" className="ml-3 block text-sm font-medium text-brand-text">For Experience</label>
                        </div>
                         <div className="flex items-center">
                           <input type="radio" id="comp-paid" name="compensationType" value="paid" checked={formData.compensationType === 'paid'} onChange={() => setFormData(p => ({...p, compensationType: 'paid'}))} className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-brand-subtle" />
                           <label htmlFor="comp-paid" className="ml-3 block text-sm font-medium text-brand-text">Paid Work</label>
                        </div>
                    </div>
                     {formData.compensationType === 'paid' && (
                        <div className="mt-3 pl-8">
                            <Input label="Hourly Rate ($USD)" type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleInputChange} placeholder="e.g., 50" min="0" />
                        </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-text-muted mb-2">Key Skills</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select value={roleCategory} onChange={handleCategoryChange} className="w-full sm:w-1/3 bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary">
                          {Object.keys(CREATIVE_ROLES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <select value={currentRole} onChange={e => setCurrentRole(e.target.value)} className="w-full sm:w-1/3 bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary">
                          {CREATIVE_ROLES[roleCategory].map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <Button type="button" variant="secondary" onClick={handleAddSkill} className="sm:w-auto">Add Skill</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {formData.skills.map(skill => (
                            <span key={skill} className="flex items-center bg-brand-subtle text-brand-text-muted px-3 py-1.5 rounded-full text-sm font-medium">
                                {skill}
                                <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-2 text-brand-muted hover:text-brand-text">&times;</button>
                            </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => handleToggleEdit(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;