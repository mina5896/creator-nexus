import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Button from '../components/ui/Button';
import { PortfolioItem } from '../types';
import Spinner from '../components/ui/Spinner';
import PortfolioFormModal from '../components/forms/PortfolioFormModal';

const PortfolioItemDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const fetchItem = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching portfolio item:', error);
      setItem(null);
    } else if (data) {
      setItem({
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        mediaUrl: data.media_url,
        mediaType: data.media_type,
        category: data.category
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);
  
  const handleDelete = async () => {
    if (!item) return;
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', item.id);
      if (error) {
        alert("Error deleting item: " + error.message);
      } else {
        alert("Item deleted successfully.");
        navigate('/portfolio');
      }
    }
  };
  
  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Spinner size="lg" />
        </div>
    );
  }

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
      
      <PortfolioFormModal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        editingItem={item}
        onSave={fetchItem}
      />

    </div>
  );
};

export default PortfolioItemDetailsPage;
