import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { Collaborator, Task, Project, Application, User, Expense } from '../types';

// Import the modals, including the new ConfirmationModal
import EditProjectModal from '../components/projects/EditProjectModal';
import AddTaskModal from '../components/projects/AddTaskModal';
import AddExpenseModal from '../components/projects/AddExpenseModal';
import ApplyModal from '../components/projects/ApplyModal';
import ConfirmationModal from '../components/ui/ConfirmationModal'; // Import the confirmation modal

type ProjectWithDetails = Project & {
    owner: User | null;
    team: Collaborator[];
    applications: Application[];
};

const ProjectDetailsPage: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAppContext();

    const [project, setProject] = useState<ProjectWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [modal, setModal] = useState<'edit' | 'addTask' | 'addExpense' | 'apply' | 'delete' | null>(null);
    const [roleToApply, setRoleToApply] = useState('');
    const [draggedOverColumn, setDraggedOverColumn] = useState<Task['status'] | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProjectDetails = useCallback(async () => {
        if (!projectId) return;

        const { data, error } = await supabase.rpc('get_project_details', { p_id: projectId });

        if (error || !data) {
            console.error("Error fetching project details:", error);
            setError("Could not find this project.");
            setLoading(false);
            return;
        }
        
        setProject(data);
        setLoading(false);
    }, [projectId]);

    useEffect(() => {
        setLoading(true);
        fetchProjectDetails();
    }, [projectId, fetchProjectDetails]);

    const handleDeleteProject = async () => {
        if (!project || user?.id !== project.ownerId) return;
        setIsDeleting(true);
        
        const { error } = await supabase.from('projects').delete().eq('id', project.id);
        
        setIsDeleting(false);
        if (error) {
            // This can be a more sophisticated toast notification in the future
            alert(`Error deleting project: ${error.message}`);
        } else {
            setModal(null); // Close the modal on success
            navigate('/dashboard');
        }
    };

    const handleApproveApplication = async (application: Application) => {
        const { error } = await supabase.rpc('approve_application', {
            p_application_id: application.id,
            p_project_id: application.projectId,
            p_user_id: application.userId,
            p_role_name: application.role
        });
        if (error) alert(`Error approving application: ${error.message}`);
        else await fetchProjectDetails();
    };

    const handleDeclineApplication = async (applicationId: string) => {
        const { error } = await supabase.from('applications').delete().eq('id', applicationId);
        if (error) alert(`Error declining application: ${error.message}`);
        else await fetchProjectDetails();
    };

    const handleTaskStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
        const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
        if (error) alert(`Error updating task: ${error.message}`);
        else await fetchProjectDetails();
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: string) => e.dataTransfer.setData("taskId", taskId);
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: Task['status']) => { e.preventDefault(); setDraggedOverColumn(status); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: Task['status']) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) handleTaskStatusUpdate(taskId, newStatus);
        setDraggedOverColumn(null);
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    if (error || !project) return <div className="text-center py-10"><h1 className="text-2xl font-bold text-brand-text">{error}</h1><Link to="/dashboard"><Button className="mt-4">Back</Button></Link></div>;

    const isOwner = user?.id === project.ownerId;
    const isTeamMember = project.team.some(member => member.userId === user?.id);
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
    const tasksByStatus = {
        todo: project.tasks.filter(t => t.status === 'todo'),
        'in-progress': project.tasks.filter(t => t.status === 'in-progress'),
        done: project.tasks.filter(t => t.status === 'done'),
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                 <button 
                    onClick={() => navigate(-1)} 
                    className="text-brand-primary hover:underline text-sm"
                >
                    &larr; Back
                </button>
                {isOwner && (
                    <div className="flex space-x-2">
                        <Button variant="ghost" onClick={() => setModal('edit')}>Edit Project</Button>
                        <Button variant="ghost" className="!text-red-400 hover:!bg-red-500/10" onClick={() => setModal('delete')}>Delete</Button>
                    </div>
                )}
            </div>

            {/* Project Info */}
            <div className="bg-brand-surface rounded-lg border border-brand-subtle overflow-hidden mb-8">
                 {project.imageUrl && <div className="w-full h-64 bg-brand-background"><img src={project.imageUrl} alt={`${project.title}`} className="w-full h-full object-cover" /></div>}
                <div className="p-8">
                    <h1 className="text-4xl font-bold text-brand-text">{project.title}</h1>
                    <p className="mt-2 text-brand-text-muted max-w-3xl">{project.description}</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Task Board */}
                    {(isOwner || isTeamMember) && (
                         <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-brand-text">Task Board</h2>
                                {isOwner && <Button onClick={() => setModal('addTask')}>+ Add Task</Button>}
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(['todo', 'in-progress', 'done'] as const).map(status => (
                                    <div key={status} onDragOver={(e) => handleDragOver(e, status)} onDragLeave={() => setDraggedOverColumn(null)} onDrop={(e) => handleDrop(e, status)} className={`space-y-4 p-4 rounded-lg transition-colors ${draggedOverColumn === status ? 'bg-brand-subtle/50' : ''}`}>
                                        <h3 className="font-semibold text-brand-text capitalize">{status.replace('-', ' ')} ({tasksByStatus[status].length})</h3>
                                        {tasksByStatus[status].map(task => (
                                            <div key={task.id} draggable={isOwner} onDragStart={(e) => isOwner && handleDragStart(e, task.id)} className={`bg-brand-subtle p-4 rounded-lg ${isOwner ? 'cursor-grab' : ''}`}>
                                                <h4 className="font-bold text-brand-text">{task.title}</h4>
                                                <p className="text-sm text-brand-text-muted mt-1">{task.description}</p>
                                                <div className="text-xs text-brand-text-muted mt-2">Assigned: {project.team.find(m=>m.userId === task.assignee)?.name || 'N/A'}</div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                    {/* Applications */}
                    {isOwner && project.applications.length > 0 && (
                        <Card>
                            <h2 className="text-2xl font-bold text-brand-text mb-4">Applications ({project.applications.length})</h2>
                            <div className="space-y-4">
                                {project.applications.map(app => (
                                    <div key={app.id} className="bg-brand-subtle p-4 rounded-lg">
                                        <p><Link to={`/profile/${app.userId}`} className="font-bold hover:underline">{app.userName}</Link> applied for <span className="font-semibold text-brand-secondary">{app.role}</span></p>
                                        {app.message && <p className="text-sm italic mt-2 pl-2 border-l-2 border-brand-subtle">"{app.message}"</p>}
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button variant="ghost" size="sm" onClick={()=>handleDeclineApplication(app.id)}>Decline</Button>
                                            <Button variant="secondary" size="sm" onClick={()=>handleApproveApplication(app)}>Approve</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Budget */}
                    {(isOwner || isTeamMember) && (
                        <Card>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-brand-text">Budget</h2>
                                {isOwner && <Button variant="secondary" size="sm" onClick={() => setModal('addExpense')}>+ Expense</Button>}
                            </div>
                            <p>Spent: <span className="font-semibold">{formatter.format(project.budget.spent)}</span> of {formatter.format(project.budget.total)}</p>
                        </Card>
                    )}
                    {/* Team Members */}
                    <Card>
                        <h2 className="text-2xl font-bold text-brand-text mb-4">Team</h2>
                        <div className="space-y-4">
                            {project.team.map(member => (
                                <Link key={member.userId} to={`/profile/${member.userId}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-brand-subtle">
                                    <img src={member.avatarUrl} alt={member.name} className="w-10 h-10 rounded-full"/>
                                    <div>
                                        <p className="font-semibold">{member.name}</p>
                                        <p className="text-sm text-brand-text-muted">{member.role}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </Card>
                    {/* Open Roles */}
                    <Card>
                        <h2 className="text-2xl font-bold text-brand-text mb-4">Open Roles</h2>
                        <div className="flex flex-col gap-3">
                             {project.rolesNeeded.map(role => (
                                <div key={role} className="flex justify-between items-center bg-brand-subtle p-3 rounded-lg">
                                    <span className="font-medium">{role}</span>
                                    {!(isOwner || isTeamMember) && <Button variant="secondary" size="sm" onClick={() => { setRoleToApply(role); setModal('apply'); }}>Apply</Button>}
                                </div>
                            ))}
                            {project.rolesNeeded.length === 0 && <p className="text-sm text-brand-text-muted">All roles filled!</p>}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            {modal === 'edit' && <EditProjectModal isOpen={true} onClose={() => setModal(null)} project={project} onSuccess={fetchProjectDetails} />}
            {modal === 'addTask' && <AddTaskModal isOpen={true} onClose={() => setModal(null)} projectId={project.id} team={project.team} onSuccess={fetchProjectDetails} />}
            {modal === 'addExpense' && <AddExpenseModal isOpen={true} onClose={() => setModal(null)} projectId={project.id} currentSpent={project.budget.spent} onSuccess={fetchProjectDetails} />}
            {modal === 'apply' && <ApplyModal isOpen={true} onClose={() => setModal(null)} project={project} role={roleToApply} onSuccess={fetchProjectDetails} />}
            {modal === 'delete' && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setModal(null)}
                    onConfirm={handleDeleteProject}
                    title={`Delete Project: ${project.title}`}
                    message="Are you sure you want to delete this project? This action is permanent and cannot be undone."
                    confirmButtonText="Delete"
                    isConfirming={isDeleting}
                />
            )}
        </div>
    );
};

export default ProjectDetailsPage;