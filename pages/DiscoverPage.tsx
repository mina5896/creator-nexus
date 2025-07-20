import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { useAppContext } from '../contexts/AppContext';

// This type matches the structure of our discover_projects_view
type DiscoverProjectType = {
  id: string;
  title: string;
  description: string;
  owner_id: string;
  owner_name: string;
  roles_needed: string[] | null; // The view can return null if no roles exist
};

const ProjectCard: React.FC<{ project: DiscoverProjectType }> = ({ project }) => {
  return (
    <Card className="flex flex-col h-full !p-0 overflow-hidden">
      <div className="p-6 flex-grow">
        <Link to={`/project/${project.id}`} className="block hover:text-brand-primary">
          <h3 className="text-xl font-bold text-brand-text">{project.title}</h3>
        </Link>
        <p className="text-sm text-brand-text-muted mt-1">
          By <Link to={`/profile/${project.owner_id}`} className="font-semibold text-brand-text-muted hover:underline hover:text-brand-primary">{project.owner_name}</Link>
        </p>
        <p className="mt-3 text-brand-text-muted text-sm line-clamp-4">{project.description}</p>
      </div>
      <div className="mt-auto pt-4 p-6 bg-brand-subtle/30">
        <h4 className="text-sm font-semibold text-brand-text-muted mb-2">Looking for</h4>
        <div className="flex flex-wrap gap-2">
          {project.roles_needed && project.roles_needed.slice(0, 4).map(role => (
            <span key={role} className="bg-brand-subtle text-brand-text px-2 py-1 rounded-md text-xs font-medium">
              {role}
            </span>
          ))}
          {project.roles_needed && project.roles_needed.length > 4 && (
            <span className="bg-brand-subtle text-brand-text px-2 py-1 rounded-md text-xs font-medium">
              +{project.roles_needed.length - 4} more
            </span>
          )}
           {!project.roles_needed && (
             <span className="text-xs text-brand-text-muted italic">No open roles specified.</span>
           )}
        </div>
      </div>
    </Card>
  );
};


const DiscoverPage: React.FC = () => {
  const { user, loading: userLoading } = useAppContext();
  const [projects, setProjects] = useState<DiscoverProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscoverProjects = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    // Correctly query the VIEW and filter out the current user's projects.
    const { data, error: selectError } = await supabase
      .from('discover_projects_view')
      .select('*')
      .not('owner_id', 'eq', user.id);

    if (selectError) {
      console.error("Error fetching discover projects from view:", selectError);
      setError("Failed to load projects. Please try again later.");
    } else {
      setProjects(data as DiscoverProjectType[]);
    }
    setLoading(false);
  },  [user?.id]);

  useEffect(() => {
    if (!userLoading && user) {
      fetchDiscoverProjects();
    }
  }, [userLoading, user, fetchDiscoverProjects]);
  
  if (userLoading) {
    return <div className="flex h-full w-full items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-2">Discover Projects</h1>
      <p className="text-brand-text-muted mb-8">Find exciting new projects from other creators and offer your skills.</p>
      
      {loading ? (
        <div className="flex h-64 w-full items-center justify-center"><Spinner size="lg" /></div>
      ) : error ? (
         <p className="text-center text-red-400">{error}</p>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard project={project} key={project.id} />
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
