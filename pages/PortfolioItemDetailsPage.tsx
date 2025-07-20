
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { PortfolioItem } from '../types';

// Re-using the form modal logic here for simplicity
const PortfolioFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    editingItem: PortfolioItem | null;
}> = ({ isOpen, onClose, editingItem }) => {
    const { addPortfolioItem, updatePortfolioItem } = useAppContext();
    
    const [newItem, setNewItem] = useState({ title: '', description: '', category: '' });
    const [mediaSourceType, setMediaSourceType] = useState<'url' | 'upload'>('url');
    const [mediaUrl, setMediaUrl] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (editingItem) {
            setNewItem({ title: editingItem.title, description: editingItem.description, category: editingItem.category });
            setMediaUrl(editingItem.mediaUrl);
            setPreview(editingItem.mediaUrl);
            setMediaSourceType('url'); 
            setMediaFile(null);
        }
    }, [editingItem, isOpen]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if(preview) URL.revokeObjectURL(preview);
            setMediaFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        let finalMediaUrl = '';
        let mediaType: 'image' | 'video' = 'image';

        if (mediaSourceType === 'upload') {
            if (!mediaFile && !editingItem) {
                setError('Please select a file to upload.'); return;
            }
            if (mediaFile) {
                finalMediaUrl = URL.createObjectURL(mediaFile);
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
            } else {
                finalMediaUrl = editingItem!.mediaUrl;
                mediaType = editingItem!.mediaType;
            }
        } else {
            if (!mediaUrl.trim()) { setError('Please provide a media URL.'); return; }
            finalMediaUrl = mediaUrl;
            mediaType = /\.(mp4|webm|ogg)$/i.test(mediaUrl) ? 'video' : 'image';
        }

        if (!newItem.title || !newItem.category || !newItem.description) {
            setError('Please fill out all fields.'); return;
        }

        const portfolioData = { ...newItem, mediaUrl: finalMediaUrl, mediaType };

        if (editingItem) {
            updatePortfolioItem(editingItem.id, portfolioData);
        } else {
            addPortfolioItem(portfolioData);
        }
        
        onClose();
    };
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={editingItem ? "Edit Portfolio Item" : "Add New Portfolio Item"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Title" name="title" value={newItem.title} onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))} required />
          <Input label="Category" name="category" value={newItem.category} onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))} required />
          <Textarea label="Description" name="description" value={newItem.description} onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-brand-text-muted mb-2">Media</label>
            <div className="flex rounded-md bg-brand-subtle p-1 space-x-1">
                <button type="button" onClick={() => setMediaSourceType('url')} className={`w-full px-3 py-1.5 text-sm font-medium rounded transition-colors ${mediaSourceType === 'url' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-muted hover:bg-brand-surface'}`}>Link</button>
                <button type="button" onClick={() => setMediaSourceType('upload')} className={`w-full px-3 py-1.5 text-sm font-medium rounded transition-colors ${mediaSourceType === 'upload' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-muted hover:bg-brand-surface'}`}>Upload</button>
            </div>
          </div>
          {mediaSourceType === 'url' ? ( <Input label="Media URL" name="mediaUrl" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />) 
          : ( <div>
                 <div className="flex items-center space-x-4">
                     <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-brand-subtle rounded-md text-sm font-medium text-brand-text bg-brand-surface hover:bg-brand-subtle">
                        <span>Choose File</span><input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/*" />
                    </label>
                    {mediaFile && <span className="text-brand-text-muted text-sm truncate w-48">{mediaFile.name}</span>}
                </div>
                {preview && (
                    <div className="mt-4 border border-brand-subtle rounded-lg p-2 bg-brand-background">
                        {mediaFile?.type.startsWith('video') || preview.includes('blob:') && mediaFile?.type.startsWith('video') || /\.(mp4|webm|ogg)$/i.test(preview) ? (
                            <video src={preview} className="rounded-md max-h-48 w-full" controls/>
                        ) : ( <img src={preview} alt="Preview" className="rounded-md max-h-48" />)}
                    </div>
                )}
             </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end pt-4 space-x-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{editingItem ? "Save Changes" : "Add Item"}</Button>
          </div>
        </form>
      </Modal>
    );
};


const PortfolioItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { portfolioItems, deletePortfolioItem } = useAppContext();
  const item = portfolioItems.find(p => p.id === id);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  if (!item) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-brand-text">Portfolio item not found</h1>
        <Link to="/portfolio">
          <Button className="mt-4">Back to Portfolio</Button>
        </Link>
      </div>
    );
  }
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deletePortfolioItem(item.id);
      navigate('/portfolio');
    }
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-4">
            <Link to="/portfolio" className="text-brand-primary hover:underline text-sm inline-block">&larr; Back to Portfolio</Link>
            <div className="flex space-x-2">
                <Button variant="ghost" onClick={() => setEditModalOpen(true)}>Edit Item</Button>
                <Button variant="ghost" className="!text-red-400 hover:!bg-red-500/10" onClick={handleDelete}>Delete</Button>
            </div>
       </div>

      <div className="bg-brand-surface rounded-lg border border-brand-subtle overflow-hidden">
        <div className="w-full aspect-video bg-brand-background flex items-center justify-center p-4">
             {item.mediaType === 'image' ? (
                <img src={item.mediaUrl} alt={item.title} className="max-w-full max-h-full object-contain"/>
            ) : (
                <video src={item.mediaUrl} className="max-w-full max-h-full" controls />
            )}
        </div>
        <div className="p-8">
            <h1 className="text-4xl font-bold text-brand-text">{item.title}</h1>
            <p className="mt-1 text-lg text-brand-secondary font-medium">{item.category}</p>
            <p className="mt-4 text-brand-text-muted max-w-3xl">{item.description}</p>
        </div>
      </div>
      
      <PortfolioFormModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} editingItem={item} />

    </div>
  );
};

export default PortfolioItemDetailsPage;
