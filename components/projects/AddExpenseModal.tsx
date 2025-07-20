import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    currentSpent: number;
    onSuccess: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, projectId, currentSpent, onSuccess }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid description and a positive amount.');
            return;
        }
        setIsSubmitting(true);
        setError(null);

        // 1. Insert the new expense
        const { error: insertError } = await supabase
            .from('expenses')
            .insert({ project_id: projectId, description, amount: numAmount });
        
        if (insertError) {
            setError(insertError.message);
            setIsSubmitting(false);
            return;
        }

        // 2. Update the project's total spent budget
        const newSpent = currentSpent + numAmount;
        const { error: updateError } = await supabase
            .from('projects')
            .update({ budget_spent: newSpent })
            .eq('id', projectId);

        if (updateError) {
            // This case is tricky. The expense was added but the total failed to update.
            // A database transaction would be better here, but for now, we'll alert the user.
            setError(`Expense added, but failed to update project budget: ${updateError.message}`);
            setIsSubmitting(false);
            onSuccess(); // Still refresh to show the new expense
        } else {
            setIsSubmitting(false);
            onSuccess();
            handleClose();
        }
    };

    const handleClose = () => {
        setDescription('');
        setAmount('');
        setError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Expense">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Expense Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Software Licenses, Asset Store purchase" required />
                <Input label="Amount ($USD)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 150.00" step="0.01" required />
                 {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Expense'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddExpenseModal;
