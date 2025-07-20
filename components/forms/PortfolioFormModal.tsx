import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../../contexts/AppContext';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { PortfolioItem } from '../../types';

interface PortfolioFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void; // A function to trigger data refetching in the parent
    editingItem: PortfolioItem | null;
}

const PortfolioFormModal: React.FC<PortfolioFormModalProps> = ({ isOpen, onClose, onSave, editingItem }) => {
    const { user } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingItem) {
            setTitle(editingItem.title);
            setDescription(editingItem.description);
            setCategory(editingItem.category);
            setMediaUrl(editingItem.mediaUrl);
        } else {
            // Reset form for "Add New"
            setTitle('');
            setDescription('');
            setCategory('');
            setMediaUrl('');
        }
    }, [editingItem, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to do this.');
            return;
        }
        if (!title || !category || !description || !mediaUrl) {
            setError('Please fill out all fields, including the media URL.');
            return;
        }
        setLoading(true);
        setError('');

        const mediaType = /\.(mp4|webm|ogg)$/i.test(mediaUrl) ? 'video' : 'image';
        
        const portfolioData = {
            title,
            description,
            category,
            media_url: mediaUrl,
            media_type: mediaType,
            user_id: user.id
        };

        let result;
        if (editingItem) {
            // Update existing item
            result = await supabase
                .from('portfolio_items')
                .update(portfolioData)
                .eq('id', editingItem.id);
        } else {
            // Insert new item
            result = await supabase
                .from('portfolio_items')
                .insert(portfolioData);
        }

        if (result.error) {
            setError(result.error.message);
            console.error("Error saving portfolio item:", result.error);
        } else {
            onSave(); // Trigger refetch in parent component
            onClose();
        }
        setLoading(false);
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? "Edit Portfolio Item" : "Add New Portfolio Item"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Character Design, Environment Art" required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <Input label="Media URL" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://... (Image or Video URL)" required />
          {/* Note: For direct file uploads, Supabase Storage should be used. This form currently only supports external URLs. */}
          
          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end pt-4 space-x-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editingItem ? "Save Changes" : "Add Item")}
            </Button>
          </div>
        </form>
      </Modal>
    );
};

export default PortfolioFormModal;
