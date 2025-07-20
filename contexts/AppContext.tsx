
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Project, PortfolioItem, Collaborator, Task, User, Invite, Application, Expense } from '../types';

interface AppContextType {
  user: User;
  users: User[];
  updateUser: (user: User) => void;
  projects: Project[];
  portfolioItems: PortfolioItem[];
  invites: Invite[];
  applications: Application[];
  addProject: (project: Omit<Project, 'id' | 'team' | 'status' | 'budget' | 'tasks' | 'ownerId' | 'expenses'> & { imageUrl?: string }) => void;
  updateProject: (projectId: string, updatedData: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (projectId: string) => void;
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'userId'>) => void;
  updatePortfolioItem: (itemId: string, updatedData: Partial<PortfolioItem>) => void;
  deletePortfolioItem: (itemId: string) => void;
  addCollaboratorToProject: (projectId: string, collaborator: Collaborator) => void;
  addTaskToProject: (projectId: string, task: Omit<Task, 'id' | 'status'>) => void;
  addMultipleTasksToProject: (projectId: string, tasks: Pick<Task, 'title' | 'description'>[]) => void;
  updateTaskStatus: (projectId: string, taskId: string, newStatus: Task['status']) => void;
  updateTaskAssignee: (projectId: string, taskId: string, assigneeId: string | null) => void;
  addExpenseToProject: (projectId: string, expenseData: { description: string; amount: number }) => void;
  sendInvite: (projectId: string, role: string) => void;
  acceptInvite: (inviteId: string) => void;
  declineInvite: (inviteId: string) => void;
  submitApplication: (projectId: string, role: string, message: string) => void;
  approveApplication: (applicationId: string) => void;
  declineApplication: (applicationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Logged-in user
const initialUser: User = {
    id: 'user-1',
    name: 'Alex Creative',
    email: 'creator@example.com',
    bio: 'A passionate multidisciplinary artist exploring the intersection of technology and storytelling. Specializing in character design and world-building.',
    avatarUrl: 'https://i.pravatar.cc/150?u=alexcreative',
    skills: ['Character Design', 'Concept Art', 'Storyboarding', 'Blender'],
    compensationType: 'paid',
    hourlyRate: 65,
};

// Other users in the system for applying/inviting
const otherUsers: User[] = [
    {
        id: 'user-sam-audio',
        name: 'Sam Audio',
        email: 'sam@audio.com',
        bio: 'Experienced Sound Designer with a passion for creating immersive soundscapes for film and games. Proficient in FMOD and Wwise.',
        avatarUrl: 'https://i.pravatar.cc/150?u=samaudio',
        skills: ['Sound Design', 'Audio Engineering', 'Foley'],
        compensationType: 'paid',
        hourlyRate: 70
    },
    {
        id: 'user-vicky-vfx',
        name: 'Vicky Visuals',
        email: 'vicky@vfx.com',
        bio: 'VFX artist specializing in particle effects and compositing. I love making things explode beautifully. Let\'s create some magic!',
        avatarUrl: 'https://i.pravatar.cc/150?u=vickyvfx',
        skills: ['VFX Artist', 'Animator', 'After Effects', 'Blender'],
        compensationType: 'experience',
    },
    {
        id: 'user-jane-producer',
        name: 'Jane Producer',
        email: 'jane@producer.com',
        bio: 'Experienced producer with a knack for keeping creative projects on time and on budget. Loves turning chaos into a clear roadmap.',
        avatarUrl: 'https://i.pravatar.cc/150?u=janeproducer',
        skills: ['Project Management', 'Agile', 'Budgeting'],
        compensationType: 'paid',
        hourlyRate: 85
    },
    {
        id: 'user-mike-writer',
        name: 'Mike Script',
        email: 'mike@writer.com',
        bio: 'Lover of all things detective and noir. Narrative designer and writer who crafts branching stories.',
        avatarUrl: 'https://i.pravatar.cc/150?u=mikescript',
        skills: ['Narrative Design', 'Scriptwriting', 'Twine'],
        compensationType: 'paid',
        hourlyRate: 60
    },
];

const initialProjects: Project[] = [
    {
      id: 'proj-1',
      ownerId: 'user-1',
      isPublic: true,
      title: 'Project Stardust',
      description: 'An immersive sci-fi animated short film about a journey through a collapsing nebula. Looking for talented artists to bring this vision to life.',
      status: 'in-progress',
      rolesNeeded: ['Sound Designer', 'VFX Artist'],
      team: [
        { userId: 'user-1', name: 'Alex Creative', role: 'Director', specialty: 'Storytelling & Cinematography', bio: 'The project lead.', portfolio: [], compensationType: 'experience' }
      ],
      budget: { total: 25000, spent: 12000 },
      tasks: [
        { id: 'task-1', title: 'Finalize script', description: 'Incorporate final feedback on the script.', assignee: 'user-1', status: 'done' },
        { id: 'task-2', title: 'Storyboard Act 1', description: 'Create storyboards for the first act.', assignee: 'user-1', status: 'in-progress' },
        { id: 'task-3', title: 'Model main character ship', description: 'Create the 3D model for the hero ship "Odyssey".', assignee: null, status: 'todo' },
      ],
      expenses: [
        { id: 'exp-1', description: 'Software Licenses', amount: 500, date: new Date().toISOString() }
      ],
      imageUrl: 'https://picsum.photos/seed/stardust-concept/1200/600',
    },
     {
      id: 'proj-2',
      ownerId: 'user-1',
      isPublic: false,
      title: 'Cyberpunk City',
      description: 'Concept art series for a next-gen video game set in a neon-drenched metropolis.',
      status: 'completed',
      rolesNeeded: [],
      team: [
         { userId: 'user-1', name: 'Alex Creative', role: 'Concept Artist', specialty: 'Environment Design', bio: 'The project lead.', portfolio: [], compensationType: 'experience' },
         { userId: 'user-temp-1', name: 'Alex Drake', role: '3D Modeler', specialty: 'Hard-surface Modeling', bio: 'AI-found collaborator who brought concepts to life.', portfolio: [], compensationType: 'paid', hourlyRate: 75 }
      ],
      budget: { total: 10000, spent: 9500 },
      tasks: [
        { id: 'task-4', title: 'Design downtown area', description: 'Create 5 key art pieces for the city center.', assignee: 'user-1', status: 'done' },
        { id: 'task-5', title: 'Model futuristic vehicles', description: 'Create 3 vehicle models based on concepts.', assignee: 'user-temp-1', status: 'done' },
      ],
      expenses: []
    },
    {
      id: 'proj-other-1',
      ownerId: 'user-jane-producer',
      isPublic: true,
      title: 'Oceanic Odyssey',
      description: 'A deep-sea exploration documentary game, aiming for photorealistic visuals of undiscovered marine life. We need a character designer to create compelling creature concepts.',
      status: 'planning',
      rolesNeeded: ['Character Designer', 'Engine Programmer'],
      team: [
        { userId:'user-jane-producer', name: 'Jane Producer', role: 'Producer', specialty: 'Project Management', bio: 'Experienced producer leading the project.', portfolio: [], compensationType: 'experience' }
      ],
      budget: { total: 50000, spent: 1000 },
      tasks: [],
      expenses: []
    },
    {
      id: 'proj-other-2',
      ownerId: 'user-mike-writer',
      isPublic: true,
      title: 'Noir Notes',
      description: 'A branching narrative detective game written in a classic noir style. We are looking for an illustrator who can capture a gritty, high-contrast black and white aesthetic.',
      status: 'planning',
      rolesNeeded: ['Illustrator', 'UI/UX Designer'],
      team: [
        { userId:'user-mike-writer', name: 'Mike Script', role: 'Writer', specialty: 'Narrative Design', bio: 'Lover of all things detective and noir.', portfolio: [], compensationType: 'experience' }
      ],
      budget: { total: 5000, spent: 0 },
      tasks: [],
      expenses: []
    }
];

const initialPortfolio: PortfolioItem[] = [
    {
      id: 'port-1',
      userId: 'user-1',
      title: 'The Crimson Bloom',
      description: 'Character design for a fantasy warrior.',
      mediaUrl: 'https://picsum.photos/seed/crimson/600/400',
      mediaType: 'image',
      category: 'Character Design'
    },
    {
      id: 'port-2',
      userId: 'user-1',
      title: 'Metropolis 2077',
      description: 'Environment concept art.',
      mediaUrl: 'https://picsum.photos/seed/metro/600/400',
      mediaType: 'image',
      category: 'Environment Art'
    },
    {
      id: 'port-3',
      userId: 'user-1',
      title: 'Creature Animation Reel',
      description: 'A showcase of various creature animations and rigging.',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      mediaType: 'video',
      category: 'Animation'
    },
    {
      id: 'port-4',
      userId: 'user-1',
      title: 'Spaceship Cockpit UI',
      description: 'Interactive UI mockups for a sci-fi game.',
      mediaUrl: 'https://picsum.photos/seed/cockpitui/600/400',
      mediaType: 'image',
      category: 'UI/UX Design'
    },
    {
      id: 'port-sam-1',
      userId: 'user-sam-audio',
      title: 'Desert Wind Soundscape',
      description: 'Layered atmospheric audio for a desert environment.',
      mediaUrl: 'https://picsum.photos/seed/desert-sound/600/400',
      mediaType: 'image',
      category: 'Sound Design'
    },
    {
      id: 'port-vicky-1',
      userId: 'user-vicky-vfx',
      title: 'Magic Missile Effect',
      description: 'A stylized magic missile VFX created in Unity.',
      mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      mediaType: 'video',
      category: 'VFX'
    },
    {
      id: 'port-vicky-2',
      userId: 'user-vicky-vfx',
      title: 'Building Collapse Simulation',
      description: 'Houdini simulation of a building collapsing.',
      mediaUrl: 'https://picsum.photos/seed/vfx-collapse/600/400',
      mediaType: 'image',
      category: 'VFX'
    }
];

const initialInvites: Invite[] = [
    { id: 'invite-1', projectId: 'proj-other-1', projectName: 'Oceanic Odyssey', role: 'Character Designer', status: 'pending', from: 'Jane Producer', fromUserId: 'user-jane-producer' }
];

const initialApplications: Application[] = [
    {
        id: 'app-1',
        projectId: 'proj-1',
        userId: 'user-sam-audio',
        userName: 'Sam Audio',
        userAvatarUrl: 'https://i.pravatar.cc/150?u=samaudio',
        role: 'Sound Designer',
        message: 'Hey! I saw you were looking for a Sound Designer for Project Stardust. I have 5 years of experience in creating immersive soundscapes for sci-fi shorts. Would love to chat.',
        status: 'pending',
        compensationType: 'paid',
        hourlyRate: 70,
    },
    {
        id: 'app-2',
        projectId: 'proj-1',
        userId: 'user-vicky-vfx',
        userName: 'Vicky Visuals',
        userAvatarUrl: 'https://i.pravatar.cc/150?u=vickyvfx',
        role: 'VFX Artist',
        message: 'The concept for Project Stardust is amazing! I specialize in nebula and particle effects in Blender and After Effects. Check out my portfolio.',
        status: 'pending',
        compensationType: 'experience',
    }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [users, setUsers] = useState<User[]>([initialUser, ...otherUsers]);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(initialPortfolio);
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [applications, setApplications] = useState<Application[]>(initialApplications);

  const updateUser = (updatedUser: User) => {
      setUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addProject = (project: Omit<Project, 'id' | 'team' | 'status' | 'budget' | 'tasks' | 'ownerId' | 'expenses'> & { imageUrl?: string }) => {
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      ownerId: user.id,
      status: 'planning',
      team: [
        { userId: user.id, name: user.name, role: 'Project Lead', specialty: 'Visionary', bio: 'The creator of this project.', portfolio: [], compensationType: 'experience' }
      ],
      budget: { total: 10000, spent: 0 },
      tasks: [],
      expenses: [],
    };
    setProjects(prev => [newProject, ...prev]);
  };
  
  const updateProject = (projectId: string, updatedData: Partial<Omit<Project, 'id'>>) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updatedData } : p));
  };
  
  const deleteProject = (projectId: string) => {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setApplications(prev => prev.filter(app => app.projectId !== projectId));
  };

  const addPortfolioItem = (item: Omit<PortfolioItem, 'id' | 'userId'>) => {
    const newItem: PortfolioItem = {
      ...item,
      id: `port-${Date.now()}`,
      userId: user.id
    };
    setPortfolioItems(prev => [newItem, ...prev]);
  };
  
  const updatePortfolioItem = (itemId: string, updatedData: Partial<PortfolioItem>) => {
    setPortfolioItems(prev => prev.map(item => item.id === itemId ? { ...item, ...updatedData } : item));
  };
  
  const deletePortfolioItem = (itemId: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  const addCollaboratorToProject = (projectId: string, collaborator: Collaborator) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { 
          ...p,
          team: [...p.team, collaborator],
          rolesNeeded: p.rolesNeeded.filter(role => role !== collaborator.role)
        } : p
      )
    );
  };
  
  const addTaskToProject = (projectId: string, task: Omit<Task, 'id' | 'status'>) => {
    const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        status: 'todo'
    };
    setProjects(prevProjects => 
        prevProjects.map(p => 
            p.id === projectId ? { ...p, tasks: [newTask, ...p.tasks] } : p
        )
    );
  };

  const addMultipleTasksToProject = (projectId: string, tasks: Pick<Task, 'title' | 'description'>[]) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const newTasks: Task[] = tasks.map((task, index) => ({
        ...task,
        id: `task-${Date.now()}-${index}`,
        status: 'todo',
        assignee: null,
    }));
    
    setProjects(prevProjects =>
        prevProjects.map(p =>
            p.id === projectId ? { ...p, tasks: [...p.tasks, ...newTasks] } : p
        )
    );
  };

  const updateTaskStatus = (projectId: string, taskId: string, newStatus: Task['status']) => {
    setProjects(prevProjects => 
        prevProjects.map(p => 
            p.id === projectId 
            ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t) } 
            : p
        )
    );
  };
  
  const updateTaskAssignee = (projectId: string, taskId: string, assigneeId: string | null) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.map(t => (t.id === taskId ? { ...t, assignee: assigneeId } : t)) }
          : p
      )
    );
  };

  const addExpenseToProject = (projectId: string, expenseData: { description: string; amount: number }) => {
    const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        description: expenseData.description,
        amount: expenseData.amount,
        date: new Date().toISOString(),
    };

    setProjects(prevProjects =>
        prevProjects.map(p =>
            p.id === projectId ? {
                ...p,
                expenses: [newExpense, ...p.expenses],
                budget: {
                    ...p.budget,
                    spent: p.budget.spent + newExpense.amount,
                }
            } : p
        )
    );
  };

  const sendInvite = (projectId: string, role: string) => {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      alert(`An invite for the ${role} role on "${project.title}" has been sent!`);
  };

  const acceptInvite = (inviteId: string) => {
      const invite = invites.find(inv => inv.id === inviteId);
      if (!invite) return;

      const newCollaborator: Collaborator = {
          userId: user.id,
          name: user.name,
          role: invite.role,
          specialty: user.skills.join(', '),
          bio: user.bio,
          compensationType: user.compensationType, 
          hourlyRate: user.hourlyRate,
          portfolio: []
      };
      
      addCollaboratorToProject(invite.projectId, newCollaborator);
      setInvites(prev => prev.filter(inv => inv.id !== inviteId));
      alert(`You've joined the project "${invite.projectName}"! It's now on your dashboard.`);
  };

  const declineInvite = (inviteId: string) => {
      setInvites(prev => prev.filter(inv => inv.id !== inviteId));
  };
  
  const submitApplication = (projectId: string, role: string, message: string) => {
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      projectId,
      userId: user.id,
      userName: user.name,
      userAvatarUrl: user.avatarUrl,
      role,
      message,
      status: 'pending',
      compensationType: user.compensationType,
      hourlyRate: user.hourlyRate,
    };
    setApplications(prev => [newApplication, ...prev]);
    alert('Your application has been submitted!');
  };

  const approveApplication = (applicationId: string) => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;
    
    const applicantUser = users.find(u => u.id === application.userId);

    const newCollaborator: Collaborator = {
      userId: application.userId,
      name: application.userName,
      role: application.role,
      specialty: applicantUser?.skills.join(', ') || 'Newly Joined',
      bio: applicantUser?.bio || 'Joined via application',
      compensationType: application.compensationType,
      hourlyRate: application.hourlyRate,
      portfolio: [],
    };

    addCollaboratorToProject(application.projectId, newCollaborator);
    setApplications(prev => prev.filter(app => app.id !== applicationId));
  };
  
  const declineApplication = (applicationId: string) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId));
  };


  const contextValue = {
      user,
      users,
      updateUser,
      projects,
      portfolioItems,
      invites,
      applications,
      addProject,
      updateProject,
      deleteProject,
      addPortfolioItem,
      updatePortfolioItem,
      deletePortfolioItem,
      addCollaboratorToProject,
      addTaskToProject,
      addMultipleTasksToProject,
      updateTaskStatus,
      updateTaskAssignee,
      addExpenseToProject,
      sendInvite,
      acceptInvite,
      declineInvite,
      submitApplication,
      approveApplication,
      declineApplication
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
