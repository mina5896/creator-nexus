
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { Collaborator, Task, Project, Application, User, PortfolioItem, Expense } from '../types';
import { CREATIVE_ROLES, ICONS } from '../constants';
import { generateTasksForGoal } from '../services/geminiService';
import Spinner from '../components/ui/Spinner';

const EditProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; project: Project }> = ({ isOpen, onClose, project }) => {
    const { updateProject } = useAppContext();
    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description);
    const [rolesNeeded, setRolesNeeded] = useState(project.rolesNeeded);
    const [isPublic, setIsPublic] = useState(project.isPublic);

    const [roleCategory, setRoleCategory] = useState(Object.keys(CREATIVE_ROLES)[0]);
    const [currentRole, setCurrentRole] = useState(CREATIVE_ROLES[roleCategory][0]);

    const handleAddRole = () => { if (currentRole && !rolesNeeded.includes(currentRole)) { setRolesNeeded([...rolesNeeded, currentRole]); } };
    const handleRemoveRole = (roleToRemove: string) => { setRolesNeeded(rolesNeeded.filter(r => r !== roleToRemove)); };
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = e.target.value;
        setRoleCategory(newCategory);
        setCurrentRole(CREATIVE_ROLES[newCategory][0]);
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProject(project.id, { title, description, rolesNeeded, isPublic });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Input label="Project Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <Textarea label="Project Description" value={description} onChange={e => setDescription(e.target.value)} required />
                 <div>
                    <label className="block text-sm font-medium text-brand-text-muted mb-2">Roles Needed</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select value={roleCategory} onChange={handleCategoryChange} className="w-full sm:w-1/3 bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary">
                          {Object.keys(CREATIVE_ROLES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <select value={currentRole} onChange={e => setCurrentRole(e.target.value)} className="w-full sm:w-1/3 bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary">
                          {CREATIVE_ROLES[roleCategory].map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <Button type="button" variant="secondary" onClick={handleAddRole} className="sm:w-auto">Add Role</Button>
                    </div>
                     <div className="flex flex-wrap gap-2 mt-4">
                        {rolesNeeded.map(role => (
                            <span key={role} className="flex items-center bg-brand-subtle text-brand-text-muted px-3 py-1.5 rounded-full text-sm font-medium">
                                {role}
                                <button type="button" onClick={() => handleRemoveRole(role)} className="ml-2 text-brand-muted hover:text-brand-text">
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                 <div className="flex items-center space-x-3">
                    <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                    <label htmlFor="isPublic" className="text-sm text-brand-text-muted">Make project public on Discover page</label>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

const GenerateTasksModal: React.FC<{ isOpen: boolean; onClose: () => void; project: Project }> = ({ isOpen, onClose, project }) => {
    const { addMultipleTasksToProject } = useAppContext();
    const [goal, setGoal] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestedTasks, setSuggestedTasks] = useState<Pick<Task, 'title' | 'description'>[]>([]);
    const [selectedTaskIndexes, setSelectedTaskIndexes] = useState<Set<number>>(new Set());

    const handleGenerate = async () => {
        if (!goal.trim()) return;
        setIsLoading(true);
        setError(null);
        setSuggestedTasks([]);
        try {
            const tasks = await generateTasksForGoal(project.description, goal);
            setSuggestedTasks(tasks);
            setSelectedTaskIndexes(new Set(tasks.map((_, index) => index)));
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleTask = (index: number) => {
        setSelectedTaskIndexes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };
    
    const handleAddTasks = () => {
        const tasksToAdd = suggestedTasks.filter((_, index) => selectedTaskIndexes.has(index));
        if (tasksToAdd.length > 0) {
            addMultipleTasksToProject(project.id, tasksToAdd);
        }
        handleClose();
    };
    
    const handleStartOver = () => {
        setGoal('');
        setSuggestedTasks([]);
        setSelectedTaskIndexes(new Set());
        setError(null);
    };

    const handleClose = () => {
        handleStartOver();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="✨ Generate Tasks with AI">
            <div className="space-y-4" style={{ minHeight: '300px' }}>
                <p className="text-brand-text-muted">Describe a high-level goal for your project. The AI Producer will break it down into actionable tasks for your board.</p>
                
                {suggestedTasks.length === 0 && !isLoading && (
                    <Textarea
                        id="goal"
                        label="Project Goal or Milestone"
                        value={goal}
                        onChange={e => setGoal(e.target.value)}
                        placeholder="e.g., 'Create a playable demo', 'Design the main villain from concept to 3D model', or 'Produce the launch trailer'..."
                        rows={4}
                        disabled={isLoading}
                    />
                )}

                {isLoading && <div className="flex justify-center items-center h-48"><Spinner size="lg"/></div>}
                
                {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-md">{error}</p>}

                {suggestedTasks.length > 0 && !isLoading && (
                    <div className="space-y-3 max-h-64 overflow-y-auto border border-brand-subtle rounded-lg p-4 bg-brand-background">
                        <p className="font-semibold text-brand-text">AI-Suggested Tasks ({selectedTaskIndexes.size}/{suggestedTasks.length} selected)</p>
                        {suggestedTasks.map((task, index) => (
                            <div key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-brand-subtle/50">
                                <input
                                    type="checkbox"
                                    id={`task-check-${index}`}
                                    checked={selectedTaskIndexes.has(index)}
                                    onChange={() => handleToggleTask(index)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                />
                                <label htmlFor={`task-check-${index}`} className="flex-grow cursor-pointer">
                                    <p className="font-medium text-brand-text">{task.title}</p>
                                    <p className="text-sm text-brand-text-muted">{task.description}</p>
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-6 mt-2 border-t border-brand-subtle">
                <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                <div className="flex space-x-2 ml-2">
                    {suggestedTasks.length === 0 ? (
                        <Button onClick={handleGenerate} disabled={isLoading || !goal.trim()}>
                            {isLoading ? 'Generating...' : 'Generate Tasks'}
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={handleStartOver}>Start Over</Button>
                            <Button onClick={handleAddTasks} disabled={selectedTaskIndexes.size === 0}>
                                Add {selectedTaskIndexes.size} Tasks
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

const ApplyModal: React.FC<{ isOpen: boolean; onClose: () => void; project: Project; role: string; }> = ({ isOpen, onClose, project, role }) => {
    const { submitApplication } = useAppContext();
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitApplication(project.id, role, message);
        onClose();
        setMessage('');
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Apply for: ${role}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-brand-text-muted">You are applying to join the project <span className="font-semibold text-brand-text">{project.title}</span>.</p>
                <Textarea label="Message to Project Owner (Optional)" value={message} onChange={e => setMessage(e.target.value)} placeholder="Introduce yourself, mention relevant experience, or explain why you're a good fit." />
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Submit Application</Button>
                </div>
            </form>
        </Modal>
    );
};

const AddExpenseModal: React.FC<{ isOpen: boolean; onClose: () => void; projectId: string; }> = ({ isOpen, onClose, projectId }) => {
    const { addExpenseToProject } = useAppContext();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
            alert('Please enter a valid description and a positive amount.');
            return;
        }
        addExpenseToProject(projectId, { description, amount: numAmount });
        onClose();
        setDescription('');
        setAmount('');
    };

    const handleClose = () => {
        setDescription('');
        setAmount('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Expense">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Expense Description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Software Licenses, Asset Store purchase" required />
                <Input label="Amount ($USD)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 150.00" required />
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add Expense</Button>
                </div>
            </form>
        </Modal>
    );
};

const TeamMemberCard: React.FC<{ member: Collaborator }> = ({ member }) => {
    const content = (
        <div className="bg-brand-subtle p-4 rounded-lg flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-brand-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                <img src={`https://i.pravatar.cc/150?u=${member.userId}`} alt={member.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
                <h4 className="font-bold text-brand-text">{member.name}</h4>
                <p className="text-sm text-brand-secondary">{member.role}</p>
                <p className="text-xs text-brand-text-muted italic mt-1">{member.specialty}</p>
            </div>
        </div>
    );
    
    return member.userId ? (
        <Link to={`/profile/${member.userId}`} className="block hover:bg-brand-primary/10 rounded-lg transition-colors">
            {content}
        </Link>
    ) : content;
};


const BudgetCard: React.FC<{ budget: { total: number, spent: number }, expenses: Expense[], isOwner: boolean, onAddExpense: () => void }> = ({ budget, expenses, isOwner, onAddExpense }) => {
    const percentage = budget.total > 0 ? (budget.spent / budget.total) * 100 : 0;
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-brand-text">Budget</h2>
                {isOwner && <Button variant="secondary" size="sm" onClick={onAddExpense}>+ Add Expense</Button>}
            </div>
            <div className="space-y-2">
                <p className="text-brand-text-muted">Spent: <span className="font-semibold text-brand-text">{formatter.format(budget.spent)}</span></p>
                <p className="text-brand-text-muted">Total: <span className="font-semibold text-brand-text">{formatter.format(budget.total)}</span></p>
            </div>
            <div className="w-full bg-brand-subtle rounded-full h-2.5 mt-4">
                <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
            </div>
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-brand-text mb-2">Recent Expenses</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {expenses.length > 0 ? expenses.slice(0, 5).map(exp => (
                        <div key={exp.id} className="flex justify-between items-center text-sm">
                            <span className="text-brand-text-muted truncate pr-4">{exp.description}</span>
                            <span className="font-semibold text-brand-text shrink-0">{formatter.format(exp.amount)}</span>
                        </div>
                    )) : (
                        <p className="text-sm text-brand-text-muted italic">No expenses logged yet.</p>
                    )}
                </div>
            </div>
        </Card>
    )
};

const AssigneeDisplay: React.FC<{ task: Task; project: Project; isOwner: boolean; }> = ({ task, project, isOwner }) => {
    const { updateTaskAssignee } = useAppContext();
    const assignedMember = project.team.find(m => m.userId === task.assignee);

    if (isOwner) {
        return (
            <div className="mt-3">
                 <label htmlFor={`assignee-${task.id}`} className="sr-only">Assignee</label>
                <select
                    id={`assignee-${task.id}`}
                    value={task.assignee || 'unassigned'}
                    onChange={(e) => updateTaskAssignee(project.id, task.id, e.target.value === 'unassigned' ? null : e.target.value)}
                    className="w-full text-xs bg-brand-surface border-none rounded-md p-1.5 text-brand-text-muted hover:bg-brand-background focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    onClick={e => e.stopPropagation()} // Prevent drag-and-drop from starting on click
                >
                    <option value="unassigned" className="italic">Unassigned</option>
                    {project.team.map(member => (
                        <option key={member.userId} value={member.userId}>
                            {member.name}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="text-xs font-semibold text-brand-text-muted mt-3 pt-1.5">
            <span className="text-brand-secondary">{assignedMember ? assignedMember.name : 'Unassigned'}</span>
        </div>
    );
};


const TaskCard: React.FC<{ task: Task; project: Project; onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void; isOwner: boolean; }> = ({ task, project, onDragStart, isOwner }) => (
    <div 
        draggable={isOwner}
        onDragStart={(e) => isOwner && onDragStart(e, task.id)}
        className={`bg-brand-subtle p-4 rounded-lg border border-transparent ${isOwner ? 'hover:border-brand-primary transition-colors cursor-grab active:cursor-grabbing' : ''}`}
    >
        <h4 className="font-bold text-brand-text">{task.title}</h4>
        <p className="text-sm text-brand-text-muted mt-1">{task.description}</p>
        <AssigneeDisplay task={task} project={project} isOwner={isOwner} />
    </div>
);

const AddTaskModal: React.FC<{ isOpen: boolean; onClose: () => void; projectId: string; team: Collaborator[] }> = ({ isOpen, onClose, projectId, team }) => {
    const { addTaskToProject } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignee, setAssignee] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim() || !description.trim()) return;
        addTaskToProject(projectId, { title, description, assignee });
        onClose();
        setTitle('');
        setDescription('');
        setAssignee(null);
    };
    
    const handleClose = () => {
        setTitle('');
        setDescription('');
        setAssignee(null);
        onClose();
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Task">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Task Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} required />
                <div>
                    <label htmlFor="assignee" className="block text-sm font-medium text-brand-text-muted mb-2">Assign To</label>
                    <select 
                        id="assignee" 
                        value={assignee || 'unassigned'} 
                        onChange={e => setAssignee(e.target.value === 'unassigned' ? null : e.target.value)} 
                        className="w-full bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        <option value="unassigned">Unassigned</option>
                        {team.map(member => <option key={member.userId} value={member.userId}>{member.name} ({member.role})</option>)}
                    </select>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button type="submit">Add Task</Button>
                </div>
            </form>
        </Modal>
    );
};

const ApplicationCard: React.FC<{application: Application, onApprove: () => void, onDecline: () => void}> = ({ application, onApprove, onDecline }) => (
    <div className="bg-brand-subtle p-4 rounded-lg">
        <div className="flex items-start gap-4">
             <Link to={`/profile/${application.userId}`}>
                <img src={application.userAvatarUrl} alt={application.userName} className="w-12 h-12 rounded-full object-cover transition-transform hover:scale-110" />
            </Link>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <p className="text-brand-text pr-4">
                        <Link to={`/profile/${application.userId}`} className="font-bold hover:underline">{application.userName}</Link>
                        <span> applied for the role of </span>
                        <span className="font-semibold text-brand-secondary">{application.role}</span>
                    </p>
                     {application.compensationType === 'paid' ? (
                         <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded-full shrink-0">${application.hourlyRate}/hr</span>
                     ) : (
                         <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-1 rounded-full shrink-0">Experience</span>
                     )}
                </div>
                {application.message && <p className="text-sm text-brand-text-muted mt-2 italic border-l-2 border-brand-subtle pl-3">"{application.message}"</p>}
                 <div className="flex justify-end items-center space-x-2 mt-3">
                    <Link to={`/profile/${application.userId}`}>
                        <Button variant="ghost" size="sm">View Profile</Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={onDecline}>Decline</Button>
                    <Button variant="secondary" size="sm" onClick={onApprove}>Approve</Button>
                </div>
            </div>
        </div>
    </div>
);

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateTaskStatus, deleteProject, user, applications, approveApplication, declineApplication } = useAppContext();
  const project = projects.find(p => p.id === id);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isGenerateTasksModalOpen, setGenerateTasksModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isApplyModalOpen, setApplyModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [roleToApply, setRoleToApply] = useState('');
  const [draggedOverColumn, setDraggedOverColumn] = useState<Task['status'] | null>(null);
  const [taskView, setTaskView] = useState<'all' | 'mine'>('all');

  if (!project) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-brand-text">Project not found</h1>
        <Link to="/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user.id === project.ownerId;
  const isTeamMember = project.team.some(member => member.userId === user.id);
  const projectApplications = applications.filter(app => app.projectId === project.id && app.status === 'pending');

  const handleDeleteProject = () => {
      if (!isOwner) return;
      if (window.confirm(`Are you sure you want to delete the project "${project.title}"? This action cannot be undone.`)) {
          deleteProject(project.id);
          navigate('/dashboard');
      }
  };

  const handleOpenApplyModal = (role: string) => {
    setRoleToApply(role);
    setApplyModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => { e.dataTransfer.setData("taskId", taskId); };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: Task['status']) => { e.preventDefault(); isOwner && setDraggedOverColumn(status); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Task['status']) => {
    e.preventDefault();
    if (!isOwner) return;
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId && project) {
      updateTaskStatus(project.id, taskId, newStatus);
    }
    setDraggedOverColumn(null);
  };
  
  const tasksByStatus = {
    todo: project.tasks.filter(t => t.status === 'todo' && (taskView === 'all' || t.assignee === user.id)),
    'in-progress': project.tasks.filter(t => t.status === 'in-progress' && (taskView === 'all' || t.assignee === user.id)),
    done: project.tasks.filter(t => t.status === 'done' && (taskView === 'all' || t.assignee === user.id)),
  };

  const statusClasses = {
    planning: 'bg-yellow-500/20 text-yellow-300',
    'in-progress': 'bg-blue-500/20 text-blue-300',
    completed: 'bg-green-500/20 text-green-300',
  };

  const TaskColumn: React.FC<{ status: Task['status']; title: string; tasks: Task[]; borderColor: string;}> = ({ status, title, tasks, borderColor }) => (
    <div 
        className={`space-y-4 p-4 rounded-lg transition-colors ${isOwner && draggedOverColumn === status ? 'bg-brand-subtle/50' : ''}`}
        onDragOver={(e) => handleDragOver(e, status)}
        onDragLeave={() => setDraggedOverColumn(null)}
        onDrop={(e) => handleDrop(e, status)}
    >
        <h3 className={`text-lg font-semibold text-brand-text border-b-2 ${borderColor} pb-2`}>{title} ({tasks.length})</h3>
        {tasks.map(task => <TaskCard key={task.id} task={task} project={project} onDragStart={handleDragStart} isOwner={isOwner}/>)}
        {tasks.length === 0 && <div className="text-center text-sm text-brand-text-muted pt-4">{isOwner ? 'Drop tasks here' : 'No tasks in this column'}</div>}
    </div>
  );

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <Link to={isTeamMember ? "/dashboard" : "/discover"} className="text-brand-primary hover:underline text-sm inline-block">&larr; Back to {isTeamMember ? 'Dashboard' : 'Discover'}</Link>
            {isOwner && (
                <div className="flex space-x-2">
                    <Button variant="ghost" onClick={() => setEditModalOpen(true)}>Edit Project</Button>
                    <Button variant="ghost" className="!text-red-400 hover:!bg-red-500/10" onClick={handleDeleteProject}>Delete</Button>
                </div>
            )}
        </div>

        <div className="bg-brand-surface rounded-lg border border-brand-subtle overflow-hidden mb-8">
            {project.imageUrl && (
                <div className="w-full h-64 bg-brand-background relative">
                    <img src={project.imageUrl} alt={`${project.title} concept art`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-surface to-transparent"></div>
                </div>
            )}
            <div className={`p-8 ${project.imageUrl ? 'pt-4' : ''}`}>
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-brand-text">{project.title}</h1>
                        <p className="mt-2 text-brand-text-muted max-w-3xl">{project.description}</p>
                    </div>
                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-full ${statusClasses[project.status]} capitalize shrink-0`}>
                        {project.status.replace('-', ' ')}
                    </span>
                </div>
            </div>
        </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            {(isOwner || isTeamMember) && (
                 <Card>
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                           <h2 className="text-2xl font-bold text-brand-text">Task Board</h2>
                            <div className="flex rounded-md bg-brand-subtle p-1 space-x-1">
                                <button onClick={() => setTaskView('all')} className={`px-3 py-1 text-sm font-medium rounded transition-colors ${taskView === 'all' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-muted hover:bg-brand-surface'}`}>All Tasks</button>
                                <button onClick={() => setTaskView('mine')} className={`px-3 py-1 text-sm font-medium rounded transition-colors ${taskView === 'mine' ? 'bg-brand-primary text-white shadow' : 'text-brand-text-muted hover:bg-brand-surface'}`}>My Tasks</button>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setGenerateTasksModalOpen(true)}>✨ Generate Tasks</Button>
                                <Button onClick={() => setTaskModalOpen(true)}>+ Add Task</Button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TaskColumn status="todo" title="To Do" tasks={tasksByStatus.todo} borderColor="border-red-500" />
                        <TaskColumn status="in-progress" title="In Progress" tasks={tasksByStatus['in-progress']} borderColor="border-yellow-500" />
                        <TaskColumn status="done" title="Done" tasks={tasksByStatus.done} borderColor="border-green-500" />
                    </div>
                </Card>
            )}
             {isOwner && projectApplications.length > 0 && (
                <Card>
                    <div className="flex items-center mb-4 gap-3">
                         <h2 className="text-2xl font-bold text-brand-text">Applications</h2>
                         <span className="bg-brand-secondary text-brand-background text-xs font-bold px-2 py-0.5 rounded-full">{projectApplications.length}</span>
                    </div>
                    <div className="space-y-4">
                        {projectApplications.map(app => (
                            <ApplicationCard 
                                key={app.id} 
                                application={app} 
                                onApprove={() => approveApplication(app.id)} 
                                onDecline={() => declineApplication(app.id)}
                            />
                        ))}
                    </div>
                </Card>
            )}
        </div>
        <div className="space-y-8">
            {(isOwner || isTeamMember) && <BudgetCard budget={project.budget} expenses={project.expenses} isOwner={isOwner} onAddExpense={() => setExpenseModalOpen(true)} />}
            <Card>
                <h2 className="text-2xl font-bold text-brand-text mb-4">Team Members</h2>
                <div className="space-y-4">
                    {project.team.map((member, index) => (
                        <TeamMemberCard key={index} member={member} />
                    ))}
                </div>
            </Card>
             <Card>
                <h2 className="text-2xl font-bold text-brand-text mb-4">Open Roles</h2>
                {project.rolesNeeded.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {project.rolesNeeded.map(role => (
                            <div key={role} className="flex justify-between items-center bg-brand-subtle p-3 rounded-lg">
                                <span className="text-brand-text font-medium">{role}</span>
                                {!(isOwner || isTeamMember) && (
                                    <Button variant="secondary" size="sm" onClick={() => handleOpenApplyModal(role)}>Apply</Button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-brand-text-muted">All roles have been filled!</p>
                )}
                 {isOwner && project.rolesNeeded.length > 0 && (
                    <Link to="/find-talent">
                        <Button variant="ghost" className="w-full mt-4">Find More Talent</Button>
                    </Link>
                 )}
            </Card>
        </div>
      </div>
      {isOwner && <AddTaskModal isOpen={isTaskModalOpen} onClose={() => setTaskModalOpen(false)} projectId={project.id} team={project.team} />}
      {isOwner && <GenerateTasksModal isOpen={isGenerateTasksModalOpen} onClose={() => setGenerateTasksModalOpen(false)} project={project} />}
      {isOwner && isEditModalOpen && <EditProjectModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} project={project} />}
      {isOwner && <AddExpenseModal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} projectId={project.id} />}
      {!(isOwner || isTeamMember) && isApplyModalOpen && <ApplyModal isOpen={isApplyModalOpen} onClose={() => setApplyModalOpen(false)} project={project} role={roleToApply} />}
    </div>
  );
};

export default ProjectDetailsPage;
