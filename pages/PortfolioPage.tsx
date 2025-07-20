import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import PortfolioFormModal from '../components/forms/PortfolioFormModal'; // Import the new modal
import { PortfolioItem } from '../types';
import Spinner from '../components/ui/Spinner';

const EditIcon = ({className}:{className:string}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>;
const TrashIcon = ({className}:{className:string}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

const PortfolioItemCard: React.FC<{ item: PortfolioItem, onEdit: () => void, onDelete: () => void }> = ({ item, onEdit, onDelete }) => (
  <Card className="overflow-hidden group relative !p-0">
    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
        <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit();}} className="p-2 bg-brand-surface/80 rounded-full hover:bg-brand-primary"><EditIcon className="w-4 h-4 text-white"/></button>
        <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete();}} className="p-2 bg-brand-surface/80 rounded-full hover:bg-red-500"><TrashIcon className="w-4 h-4 text-white"/></button>
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

const PortfolioPage: React.FC = () => {
  const { user } = useAppContext();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  
  const fetchPortfolioItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching portfolio items:', error);
    } else {
      // Map Supabase snake_case to our camelCase type
      const items = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        description: item.description,
        mediaUrl: item.media_url,
        mediaType: item.media_type,
        category: item.category
      }));
      setPortfolioItems(items);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPortfolioItems();
  }, [fetchPortfolioItems]);

  const handleOpenModal = (item: PortfolioItem | null = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };
  
  const handleDelete = async (item: PortfolioItem) => {
      if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
          const { error } = await supabase.from('portfolio_items').delete().eq('id', item.id);
          if (error) {
            alert("Error deleting item: " + error.message);
          } else {
            setPortfolioItems(prev => prev.filter(i => i.id !== item.id));
            alert("Item deleted successfully.");
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-text">My Portfolio</h1>
        <Button onClick={() => handleOpenModal()}>+ Add Item</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems.map(item => (
            <PortfolioItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => handleOpenModal(item)}
                onDelete={() => handleDelete(item)}
            />
        ))}
      </div>
      
      {!loading && portfolioItems.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-brand-subtle rounded-lg">
              <h3 className="text-xl font-semibold text-brand-text">Your portfolio is empty</h3>
              <p className="mt-2 text-brand-text-muted">Click "+ Add Item" to showcase your work.</p>
          </div>
      )}

      <PortfolioFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        editingItem={editingItem}
        onSave={fetchPortfolioItems} // Pass the fetch function to refetch data on save
      />
    </div>
  );
};

export default PortfolioPage;
