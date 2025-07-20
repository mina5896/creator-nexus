export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
  compensationType: 'paid' | 'experience';
  hourlyRate?: number;
}

export interface PortfolioItem {
  id: string;
  userId: string; // Link to the user who owns this item
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  category: string;
}

export interface Collaborator {
  userId?: string; // Link to a real user if they've joined
  name:string;
  role: string;
  specialty: string;
  bio: string;
  avatarUrl?: string; // Added this property
  compensationType: 'paid' | 'experience';
  hourlyRate?: number;
  portfolio: {
    title: string;
    description: string;
    imageUrl: string;
  }[];
}

export interface Task {
    id: string;
    title: string;
    description: string;
    assignee: string | null; // userId of the collaborator, null if unassigned
    status: 'todo' | 'in-progress' | 'done';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface Project {
  id: string;
  ownerId: string;
  isPublic: boolean;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  rolesNeeded: string[];
  team: Collaborator[];
  budget: {
      total: number;
      spent: number;
  };
  tasks: Task[];
  expenses: Expense[];
  imageUrl?: string; // For AI-generated concept art
}

export interface Invite {
  id: string;
  projectId: string;
  projectName: string;
  role: string;
  status: 'pending' | 'accepted' | 'declined';
  from: string; // Name of the person who sent the invite
  fromUserId: string; // ID of the person who sent the invite
}

export interface Application {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  role: string;
  message: string;
  status: 'pending';
  compensationType: 'paid' | 'experience';
  hourlyRate?: number;
}
