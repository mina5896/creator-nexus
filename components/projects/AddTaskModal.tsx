import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Collaborator } from '../../types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    team: Collaborator[];
    onSuccess: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, projectId, team, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeId, setAssigneeId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("Title is required.");
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const { error: insertError } = await supabase
            .from('tasks')
            .insert({
                project_id: projectId,
                title: title,
                description: description,
                assignee_id: assigneeId,
                status: 'todo',
            });
        
        if (insertError) {
            setError(insertError.message);
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
            onSuccess();
            handleClose();
        }
    };
    
    const handleClose = () => {
        setTitle('');
        setDescription('');
        setAssigneeId(null);
        setError(null);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Task">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-brand-text-muted mb-2">Assign To</label>
                    <select 
                        id="assignee" 
                        value={assigneeId || 'unassigned'} 
                        onChange={e => setAssigneeId(e.target.value === 'unassigned' ? null : e.target.value)} 
                        className="w-full bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        <option value="unassigned">Unassigned</option>
                        {team.map(member => <option key={member.userId} value={member.userId}>{member.name} ({member.role})</option>)}
                    </select>
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Task'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddTaskModal;
