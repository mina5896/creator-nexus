import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PortfolioItem, Project, User } from '../types';
import Spinner from '../components/ui/Spinner';

// This component can be reused as it doesn't have edit/delete logic
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

// This component can also be reused
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
            {/* Note: We need to fetch rolesNeeded separately if it's in another table */}
            {/* This part will be completed when ProjectDetailsPage is refactored */}
            <span className="text-xs text-brand-text-muted italic">Roles info coming soon</span>
          </div>
        </div>
      </Card>
    </Link>
);


const PublicProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user: loggedInUser } = useAppContext(); // Get the currently logged-in user

    const [profile, setProfile] = useState<User | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError("No user ID provided.");
            setLoading(false);
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);

            // Fetch all data in parallel
            const [profileRes, portfolioRes, projectsRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', userId).single(),
                supabase.from('portfolio_items').select('*').eq('user_id', userId),
                supabase.from('projects').select('*').eq('owner_id', userId).eq('is_public', true)
            ]);

            if (profileRes.error) {
                console.error("Error fetching profile:", profileRes.error);
                setError("Could not find this creator's profile.");
                setProfile(null);
            } else {
                 setProfile({
                    id: profileRes.data.id,
                    name: profileRes.data.name,
                    email: profileRes.data.email,
                    bio: profileRes.data.bio,
                    avatarUrl: profileRes.data.avatar_url,
                    skills: profileRes.data.skills,
                    compensationType: profileRes.data.compensation_type,
                    hourlyRate: profileRes.data.hourly_rate
                });
            }

            if (portfolioRes.error) console.error("Error fetching portfolio:", portfolioRes.error);
            else setPortfolio(portfolioRes.data.map(item => ({
                id: item.id,
                userId: item.user_id,
                title: item.title,
                description: item.description,
                mediaUrl: item.media_url,
                mediaType: item.media_type,
                category: item.category
            })));

            if (projectsRes.error) console.error("Error fetching projects:", projectsRes.error);
            else setProjects(projectsRes.data as Project[]); // Cast for now, will need mapping later

            setLoading(false);
        };

        fetchProfileData();
    }, [userId]);
    
    if (loading) {
      return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>
    }
    
    if (error || !profile) {
        return (
            <div className="text-center py-10">
                <h1 className="text-2xl font-bold text-brand-text">{error || "User not found"}</h1>
                <Link to="/discover">
                    <Button className="mt-4">Back to Discover</Button>
                </Link>
            </div>
        );
    }
    
    const CompensationDisplay = () => {
        if (profile.compensationType === 'paid') {
            return <span className="text-lg font-semibold text-green-400">${profile.hourlyRate}/hr</span>
        }
        return <span className="text-lg font-semibold text-purple-400">Open to Experience</span>
    };

    return (
        <div>
            <Card className="mb-8">
                 <div className="flex flex-col md:flex-row items-start gap-8">
                    <div className="flex-shrink-0 text-center w-full md:w-48">
                      <img src={profile.avatarUrl} alt="User avatar" className="w-40 h-40 rounded-full mx-auto border-4 border-brand-primary object-cover" />
                    </div>
                    <div className="flex-grow w-full">
                          <div className="flex justify-between items-start">
                            <h2 className="text-3xl font-bold text-brand-text">{profile.name}</h2>
                            <CompensationDisplay />
                          </div>
                          <p className="text-brand-text-muted mt-4">{profile.bio}</p>
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-brand-text mb-2">Key Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {profile.skills?.map(skill => (
                                <span key={skill} className="bg-brand-secondary/20 text-brand-secondary px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                              ))}
                              {(!profile.skills || profile.skills.length === 0) && <p className="text-sm text-brand-text-muted">No skills listed.</p>}
                            </div>
                          </div>
                          {profile.id === loggedInUser?.id && (
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
                <h2 className="text-2xl font-bold text-brand-text mb-4">{profile.name}'s Portfolio</h2>
                {portfolio.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolio.map(item => <PublicPortfolioItemCard key={item.id} item={item} />)}
                    </div>
                ) : (
                    <p className="text-brand-text-muted italic">This creator hasn't added any portfolio items yet.</p>
                )}
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-brand-text mb-4">{profile.name}'s Public Projects</h2>
                 {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => <PublicProjectCard key={project.id} project={project} />)}
                    </div>
                 ) : (
                     <p className="text-brand-text-muted italic">This creator has no public projects.</p>
                 )}
            </div>

        </div>
    );
};

export default PublicProfilePage;
