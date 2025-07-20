import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Project } from '../types';
import { ICONS } from '../constants';

const ProjectCard: React.FC<{ project: Project; onDelete: (projectId: string) => void; isOwner: boolean; pendingApplicationsCount: number; }> = ({ project, onDelete, isOwner, pendingApplicationsCount }) => {
  const navigate = useNavigate();
  
  const statusClasses = {
    planning: 'bg-yellow-500/20 text-yellow-300',
    'in-progress': 'bg-blue-500/20 text-blue-300',
    completed: 'bg-green-500/20 text-green-300',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      onDelete(project.id);
    }
  };
  
  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      className="group h-full flex flex-col cursor-pointer"
    >
      <div className="relative flex-grow">
        {isOwner && (
          <button
            onClick={handleDelete}
            className="absolute top-[-10px] right-[-10px] z-10 p-2 bg-brand-surface/80 rounded-full text-brand-text-muted hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Delete project"
          >
            {ICONS.trash}
          </button>
        )}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-brand-text pr-8">{project.title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[project.status]} shrink-0`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>
        <p 
          className="mt-2 text-brand-text-muted"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>
      </div>
      <div className="mt-auto pt-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-brand-text-muted">Team</h4>
          {isOwner && pendingApplicationsCount > 0 && (
              <div className="flex items-center gap-1.5 bg-brand-secondary/20 text-brand-secondary px-2 py-1 rounded-full text-xs font-semibold">
                {React.cloneElement(ICONS.clipboardCheck, { className: "h-4 w-4" })}
                <span>{pendingApplicationsCount}</span>
              </div>
          )}
        </div>
        <div className="flex -space-x-2">
          {project.team.slice(0, 5).map((member, index) => (
            <div key={index} className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold ring-2 ring-brand-surface" title={member.name}>
                {member.name.charAt(0)}
            </div>
          ))}
          {project.team.length > 5 && (
             <div className="h-8 w-8 rounded-full bg-brand-subtle flex items-center justify-center text-white text-xs font-bold ring-2 ring-brand-surface">
                +{project.team.length - 5}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const { projects, deleteProject, user, applications } = useAppContext();
  
  const userProjects = projects.filter(p => p.ownerId === user.id || p.team.some(member => member.userId === user.id));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-text">My Projects</h1>
        <Link to="/create-project">
          <Button>+ New Project</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userProjects.map(project => {
          const pendingApplicationsCount = applications.filter(
            app => app.projectId === project.id && app.status === 'pending'
          ).length;

          return (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onDelete={deleteProject} 
              isOwner={project.ownerId === user.id}
              pendingApplicationsCount={pendingApplicationsCount}
            />
          );
        })}
        {userProjects.length === 0 && (
          <div className="col-span-full text-center py-16 border-2 border-dashed border-brand-subtle rounded-lg">
              <h3 className="text-xl font-semibold text-brand-text">No projects yet!</h3>
              <p className="mt-2 text-brand-text-muted">Click "+ New Project" to get started, or check the "Discover" page for opportunities.</p>
          </div>
      )}
      </div>
    </div>
  );
};

export default DashboardPage;