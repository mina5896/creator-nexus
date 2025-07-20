
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import { Project } from '../types';

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const { users } = useAppContext();
  const projectOwner = users.find(user => user.id === project.ownerId);

  return (
    
      <Card className="flex flex-col h-full !p-0 overflow-hidden">
        <div className="p-6 flex-grow">
          <Link to={`/project/${project.id}`} className="block hover:text-brand-primary">
            <h3 className="text-xl font-bold text-brand-text">{project.title}</h3>
          </Link>
          {projectOwner && (
            <p className="text-sm text-brand-text-muted mt-1">
              By <Link to={`/profile/${projectOwner.id}`} className="font-semibold text-brand-text-muted hover:underline hover:text-brand-primary" onClick={e => e.stopPropagation()}>{projectOwner.name}</Link>
            </p>
          )}
          <p className="mt-3 text-brand-text-muted text-sm line-clamp-4">{project.description}</p>
        </div>
        <div className="mt-auto pt-4 p-6 bg-brand-subtle/30">
          <h4 className="text-sm font-semibold text-brand-text-muted mb-2">Looking for</h4>
          <div className="flex flex-wrap gap-2">
            {project.rolesNeeded.slice(0, 4).map(role => (
              <span key={role} className="bg-brand-subtle text-brand-text px-2 py-1 rounded-md text-xs font-medium">
                {role}
              </span>
            ))}
            {project.rolesNeeded.length > 4 && (
              <span className="bg-brand-subtle text-brand-text px-2 py-1 rounded-md text-xs font-medium">
                +{project.rolesNeeded.length - 4} more
              </span>
            )}
          </div>
        </div>
      </Card>
    
  );
};


const DiscoverPage: React.FC = () => {
  const { projects, user } = useAppContext();

  const publicProjects = projects.filter(
    p => p.isPublic && 
    p.ownerId !== user.id && // Don't show the user's own projects
    p.rolesNeeded.length > 0 && 
    p.status !== 'completed'
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-2">Discover Projects</h1>
      <p className="text-brand-text-muted mb-8">Find exciting new projects from other creators and offer your skills.</p>
      
      {publicProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicProjects.map(project => (
             <Link to={`/project/${project.id}`} key={project.id} className="block h-full">
                <ProjectCard project={project} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center py-16 border-2 border-dashed border-brand-subtle rounded-lg">
            <h3 className="text-xl font-semibold text-brand-text">No public projects right now</h3>
            <p className="mt-2 text-brand-text-muted">Check back later or create your own public project!</p>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
