
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PortfolioItem, Project } from '../types';

const PublicPortfolioItemCard: React.FC<{ item: PortfolioItem }> = ({ item }) => (
  <Card className="overflow-hidden group relative !p-0">
     <div className="w-full h-48 bg-brand-subtle">
       {item.mediaType === 'image' ? (
            <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover"/>
        ) : (
            <video src={item.mediaUrl} className="w-full h-full object-cover" />
        )}
    </div>
    <div className="p-4 bg-brand-surface">
        <h3 className="text-lg font-bold text-brand-text truncate">{item.title}</h3>
        <p className="text-sm text-brand-primary font-medium">{item.category}</p>
        <p className="mt-2 text-sm text-brand-text-muted h-10 overflow-hidden">{item.description}</p>
    </div>
  </Card>
);

const PublicProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <Link to={`/project/${project.id}`} className="block h-full">
      <Card className="flex flex-col h-full !p-0 overflow-hidden">
        <div className="p-6 flex-grow">
          <h3 className="text-xl font-bold text-brand-text">{project.title}</h3>
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
             {project.rolesNeeded.length === 0 && <span className="text-xs text-brand-text-muted italic">All roles filled</span>}
          </div>
        </div>
      </Card>
    </Link>
);


const PublicProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { users, portfolioItems, projects, user: loggedInUser } = useAppContext();

    const user = users.find(u => u.id === userId);
    
    if (!user) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold text-brand-text">User not found</h1>
                <Link to="/dashboard">
                <Button className="mt-4">Back to Dashboard</Button>
                </Link>
            </div>
        );
    }
    
    const userPortfolio = portfolioItems.filter(item => item.userId === user.id);
    const userPublicProjects = projects.filter(p => p.ownerId === user.id && p.isPublic);

    const CompensationDisplay = () => {
        if (user.compensationType === 'paid') {
            return <span className="text-lg font-semibold text-green-400">${user.hourlyRate}/hr</span>
        }
        return <span className="text-lg font-semibold text-purple-400">Open to Experience</span>
    };

    return (
        <div>
            <Card className="mb-8">
                 <div className="flex flex-col md:flex-row items-start gap-8">
                    <div className="flex-shrink-0 text-center w-full md:w-48">
                      <img src={user.avatarUrl} alt="User avatar" className="w-40 h-40 rounded-full mx-auto border-4 border-brand-primary object-cover" />
                    </div>
                    <div className="flex-grow w-full">
                          <div className="flex justify-between items-start">
                            <h2 className="text-3xl font-bold text-brand-text">{user.name}</h2>
                            <CompensationDisplay />
                          </div>
                          <p className="text-brand-text-muted mt-4">{user.bio}</p>
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-brand-text mb-2">Key Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {user.skills.map(skill => (
                                <span key={skill} className="bg-brand-secondary/20 text-brand-secondary px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                              ))}
                              {user.skills.length === 0 && <p className="text-sm text-brand-text-muted">No skills listed.</p>}
                            </div>
                          </div>
                          {user.id === loggedInUser.id && (
                            <div className="mt-8 flex justify-end">
                                <Link to="/profile">
                                    <Button>Edit My Profile</Button>
                                </Link>
                            </div>
                           )}
                    </div>
                </div>
            </Card>

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-brand-text mb-4">{user.name}'s Portfolio</h2>
                {userPortfolio.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userPortfolio.map(item => <PublicPortfolioItemCard key={item.id} item={item} />)}
                    </div>
                ) : (
                    <p className="text-brand-text-muted italic">This creator hasn't added any portfolio items yet.</p>
                )}
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-brand-text mb-4">{user.name}'s Public Projects</h2>
                 {userPublicProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userPublicProjects.map(project => <PublicProjectCard key={project.id} project={project} />)}
                    </div>
                 ) : (
                     <p className="text-brand-text-muted italic">This creator has no public projects.</p>
                 )}
            </div>

        </div>
    );
};

export default PublicProfilePage;
