import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Project } from '../types'; // Using the original Project type for structure
import { ICONS } from '../constants';
import Spinner from '../components/ui/Spinner';

// A type for the data we fetch from Supabase, which is slightly different from the component's Project type
type FetchedProjectType = {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  owner_id: string;
  team_members: {
    profiles: {
      id: string;
      name: string;
      avatar_url: string;
    } | null;
  }[];
  applications: {
    id: string;
    status: string;
  }[];
};


const ProjectCard: React.FC<{ project: FetchedProjectType; onDelete: (projectId: string) => void; isOwner: boolean; }> = ({ project, onDelete, isOwner }) => {
  const navigate = useNavigate();
  
  const statusClasses = {
    planning: 'bg-yellow-500/20 text-yellow-300',
    'in-progress': 'bg-blue-500/20 text-blue-300',
    completed: 'bg-green-500/20 text-green-300',
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
      onDelete(project.id);
    }
  };
  
  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };
  
  const pendingApplicationsCount = project.applications.filter(app => app.status === 'pending').length;

  return (
    <Card 
      onClick={handleCardClick}
      className="group h-full flex flex-col cursor-pointer"
    >
      <div className="relative flex-grow">
        {isOwner && (
          <button
            onClick={handleDeleteClick}
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
          {project.team_members.slice(0, 5).map((member, index) => (
            member.profiles ? (
              <img 
                key={member.profiles.id}
                src={member.profiles.avatar_url}
                alt={member.profiles.name}
                title={member.profiles.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-surface"
              />
            ) : null
          ))}
          {project.team_members.length > 5 && (
             <div className="h-8 w-8 rounded-full bg-brand-subtle flex items-center justify-center text-white text-xs font-bold ring-2 ring-brand-surface">
                +{project.team_members.length - 5}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAppContext();
  const [projects, setProjects] = useState<FetchedProjectType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get IDs of projects the user owns
    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id);

    // Get IDs of projects the user is a team member of
    const { data: memberProjects, error: memberError } = await supabase
      .from('team_members')
      .select('project_id')
      .eq('user_id', user.id);

    if (ownedError || memberError) {
      console.error("Error fetching project associations:", ownedError || memberError);
      setLoading(false);
      return;
    }
    
    const ownedIds = ownedProjects?.map(p => p.id) || [];
    const memberIds = memberProjects?.map(p => p.project_id) || [];
    const projectIds = [...new Set([...ownedIds, ...memberIds])];

    if (projectIds.length === 0) {
      setProjects([]);
      setLoading(false);
      return;
    }

    // Fetch full project data for the identified projects
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        status,
        owner_id,
        team_members (
          profiles (
            id,
            name,
            avatar_url
          )
        ),
        applications (
          id,
          status
        )
      `)
      .in('id', projectIds);

    if (error) {
      console.error("Error fetching projects:", error);
    } else if (data) {
      setProjects(data as unknown as FetchedProjectType[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      alert("Error deleting project: " + error.message);
    } else {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      alert("Project deleted successfully.");
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Spinner size="lg" />
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-text">My Projects</h1>
        <Link to="/create-project">
          <Button>+ New Project</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onDelete={handleDeleteProject} 
              isOwner={project.owner_id === user?.id}
            />
          )
        )}
      </div>

      {!loading && projects.length === 0 && (
          <div className="col-span-full text-center py-16 border-2 border-dashed border-brand-subtle rounded-lg">
              <h3 className="text-xl font-semibold text-brand-text">No projects yet!</h3>
              <p className="mt-2 text-brand-text-muted">Click "+ New Project" to get started, or check the "Discover" page for opportunities.</p>
          </div>
      )}
    </div>
  );
};

export default DashboardPage;

