
import React from 'react';
import Card from '../components/ui/Card';
import { ICONS } from '../constants';

const MessagesPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-8">Messages</h1>
      <Card>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="p-4 bg-brand-subtle rounded-full mb-4">
            {React.cloneElement(ICONS.messages, { className: "h-12 w-12 text-brand-secondary" })}
          </div>
          <h2 className="text-2xl font-bold text-brand-text">Messaging Not Implemented</h2>
          <p className="mt-2 max-w-md text-brand-text-muted">
            This is a placeholder page. In a fully-featured application, this is where your conversations with collaborators would appear.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default MessagesPage;
