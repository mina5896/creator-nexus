import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { PortfolioItem } from '../types';

const EditIcon = ({className}:{className:string}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>;
const TrashIcon = ({className}:{className:string}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;


const PortfolioItemCard: React.FC<{ item: PortfolioItem, onEdit: () => void, onDelete: () => void }> = ({ item, onEdit, onDelete }) => (
  <Card className="overflow-hidden group relative">
    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
        <button onClick={(e) => { e.preventDefault(); onEdit();}} className="p-2 bg-brand-surface/80 rounded-full hover:bg-brand-primary"><EditIcon className="w-4 h-4 text-white"/></button>
        <button onClick={(e) => { e.preventDefault(); onDelete();}} className="p-2 bg-brand-surface/80 rounded-full hover:bg-red-500"><TrashIcon className="w-4 h-4 text-white"/></button>
    </div>
    <Link to={`/portfolio/${item.id}`} className="block">
        <div className="w-full h-48 bg-brand-subtle">
           {item.mediaType === 'image' ? (
                <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover"/>
            ) : (
                <video src={item.mediaUrl} className="w-full h-full object-cover" />
            )}
        </div>
        <div className="p-4 bg-brand-surface">
            <h3 className="text-lg font-bold text-brand-text truncate">{item.title}</h3>
            <p className="text-sm text-brand-primary font-medium">{item.category}</p>
            <p className="mt-2 text-sm text-brand-text-muted h-10 overflow-hidden">{item.description}</p>
        </div>
    </Link>
  </Card>
);

const PortfolioFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    editingItem: PortfolioItem | null;
}> = ({ isOpen, onClose, editingItem }) => {
    const { addPortfolioItem, updatePortfolioItem, user } = useAppContext();
    
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
            // File upload state is reset when editing
            setMediaSourceType('url'); 
            setMediaFile(null);
        } else {
            // Reset form for "Add New"
            setNewItem({ title: '', description: '', category: '' });
            setMediaUrl('');
            setPreview(null);
        }
    }, [editingItem, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (preview) URL.revokeObjectURL(preview); // Clean up previous preview
            setMediaFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        let finalMediaUrl = '';
        let mediaType: 'image' | 'video' = 'image';

        if (mediaSourceType === 'upload') {
            if (!mediaFile && !editingItem) { // Require file only if adding new, not if editing without changing file
                setError('Please select a file to upload.');
                return;
            }
            if (mediaFile) {
                finalMediaUrl = URL.createObjectURL(mediaFile);
                mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
            } else {
                finalMediaUrl = editingItem!.mediaUrl;
                mediaType = editingItem!.mediaType;
            }
        } else {
            if (!mediaUrl.trim()) {
                setError('Please provide a media URL.');
                return;
            }
            finalMediaUrl = mediaUrl;
            mediaType = /\.(mp4|webm|ogg)$/i.test(mediaUrl) ? 'video' : 'image';
        }

        if (!newItem.title || !newItem.category || !newItem.description) {
            setError('Please fill out all fields.');
            return;
        }

        const portfolioData = {
            ...newItem,
            mediaUrl: finalMediaUrl,
            mediaType: mediaType,
        };

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


const PortfolioPage: React.FC = () => {
  const { portfolioItems, deletePortfolioItem, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  
  const userPortfolioItems = portfolioItems.filter(item => item.userId === user.id);

  const handleOpenModal = (item: PortfolioItem | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };
  
  const handleDelete = (item: PortfolioItem) => {
      if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
          deletePortfolioItem(item.id);
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-text">My Portfolio</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Item</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userPortfolioItems.map(item => (
            <PortfolioItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleOpenModal(item)}
                onDelete={() => handleDelete(item)}
            />
        ))}
      </div>
      
      {userPortfolioItems.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-brand-subtle rounded-lg">
              <h3 className="text-xl font-semibold text-brand-text">Your portfolio is empty</h3>
              <p className="mt-2 text-brand-text-muted">Click "+ Add Item" to showcase your work.</p>
          </div>
      )}

      <PortfolioFormModal isOpen={isModalOpen} onClose={handleCloseModal} editingItem={editingItem} />
    </div>
  );
};

export default PortfolioPage;