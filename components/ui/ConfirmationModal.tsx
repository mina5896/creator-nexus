import React from 'react';
import Modal from './Modal';
import Button from './Button';
import Spinner from './Spinner';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  isConfirming?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  isConfirming = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-brand-text-muted">{message}</p>
        <div className="flex justify-end pt-4 space-x-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button
            type="button"
            className="!bg-red-600 hover:!bg-red-700 focus:ring-red-500"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? <Spinner size="sm" /> : confirmButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;