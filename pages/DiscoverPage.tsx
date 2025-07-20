import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { Project } from '../types';

// Define a more specific type for the data we fetch
type ProjectWithDetails = Project & {
  profiles: { id: string; name: string } | null; // owner profile
  project_roles_needed: { role_name: string }[];
};

const ProjectCard: React.FC<{ project: ProjectWithDetails }> = ({ project }) => {
  const projectOwner = project.profiles;

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
            {project.project_roles_needed.slice(0, 4).map(role => (
              <span key={role.role_name} className="bg-brand-subtle text-brand-text px-2 py-1 rounded-md text-xs font-medium">
                {role.role_name}
              </span>
            ))}
            {project.project_roles_needed.length > 4 && (
              <span className="bg-brand-subtle text-brand-text px-2 py-1 rounded-md text-xs font-medium">
                +{project.project_roles_needed.length - 4} more
              </span>
            )}
             {project.project_roles_needed.length === 0 && (
                 <span className="text-xs text-brand-text-muted italic">No open roles</span>
             )}
          </div>
        </div>
      </Card>
  );
};


const DiscoverPage: React.FC = () => {
  const { user } = useAppContext();
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProjects = async () => {
        if (!user) return; // Wait until the user is loaded

        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                profiles ( id, name ),
                project_roles_needed ( role_name )
            `)
            .eq('is_public', true)
            .neq('status', 'completed')
            .neq('owner_id', user.id); // Exclude the logged-in user's projects

        if (error) {
            console.error('Error fetching public projects:', error);
            setError('Failed to load projects. Please try again later.');
        } else if (data) {
            // Further filter in JS to only include projects that have open roles
            const openProjects = data.filter(p => p.project_roles_needed && p.project_roles_needed.length > 0);
            setProjects(openProjects as ProjectWithDetails[]);
        }
        setLoading(false);
    };

    if (user) {
        fetchPublicProjects();
    }
  }, [user]);

  if (loading) {
      return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-2">Discover Projects</h1>
      <p className="text-brand-text-muted mb-8">Find exciting new projects from other creators and offer your skills.</p>
      
      {error && <p className="text-center text-red-400">{error}</p>}

      {!error && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
             <Link to={`/project/${project.id}`} key={project.id} className="block h-full">
                <ProjectCard project={project} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="col-span-full text-center py-16 border-2 border-dashed border-brand-subtle rounded-lg">
            <h3 className="text-xl font-semibold text-brand-text">No public projects available right now</h3>
            <p className="mt-2 text-brand-text-muted">Check back later or make one of your own projects public!</p>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
