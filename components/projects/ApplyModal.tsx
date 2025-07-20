import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Project } from '../../types';
import Modal from '../ui/Modal';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';

interface ApplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    role: string;
    onSuccess: () => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, project, role, onSuccess }) => {
    const { user } = useAppContext();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError("You must be logged in to apply.");
            return;
        }
        setIsSubmitting(true);
        setError(null);

        const { error: insertError } = await supabase
            .from('applications')
            .insert({
                project_id: project.id,
                user_id: user.id,
                role: role,
                message: message,
            });

        if (insertError) {
            // Check for unique constraint violation (user already applied)
            if (insertError.code === '23505') {
                 setError("You have already applied for a role on this project.");
            } else {
                 setError(insertError.message);
            }
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
            onSuccess();
            handleClose();
            alert('Application submitted successfully!');
        }
    };

    const handleClose = () => {
        setMessage('');
        setError(null);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Apply for: ${role}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-brand-text-muted">You are applying to join the project <span className="font-semibold text-brand-text">{project.title}</span>.</p>
                <Textarea label="Message to Project Owner (Optional)" value={message} onChange={e => setMessage(e.target.value)} placeholder="Introduce yourself, mention relevant experience, or explain why you're a good fit." rows={4} />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ApplyModal;
