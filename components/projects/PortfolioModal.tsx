import React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Collaborator } from '../../types';

interface PortfolioModalProps {
  collaborator: Collaborator | null;
  isOpen: boolean;
  onClose: () => void;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({ collaborator, isOpen, onClose }) => {
    if (!collaborator) return null;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${collaborator.name}'s Portfolio`}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-brand-text">{collaborator.name}</h3>
                    <p className="text-brand-secondary font-semibold">{collaborator.role}</p>
                    <p className="text-sm text-brand-text-muted mt-1 italic">Specialty: {collaborator.specialty}</p>
                </div>
                <p className="text-brand-text-muted">{collaborator.bio}</p>
                <div>
                    <h4 className="text-lg font-semibold text-brand-text mb-4">Work Examples</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                        {collaborator.portfolio.map((item, index) => (
                            <div key={index} className="bg-brand-subtle rounded-lg overflow-hidden">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                                <div className="p-4">
                                    <h5 className="font-bold text-brand-text">{item.title}</h5>
                                    <p className="text-sm text-brand-text-muted mt-1">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};

export default PortfolioModal;
