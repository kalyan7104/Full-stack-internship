import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import RepositoryGrid from '@/components/RepositoryGrid';
import { Repository } from '@/components/RepositoryCard';
import { githubService } from '@/services/githubService';
import { Button } from '@/components/ui/button';
import { Database, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStoredRepositories();
  }, []);

  const loadStoredRepositories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stored = await githubService.getAllStoredRepositories();
      setRepositories(stored);
      
      if (stored.length === 0) {
        toast({
          title: "No stored data",
          description: "No repositories found in database. Try searching first.",
          variant: "default"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stored data';
      setError(errorMessage);
      
      toast({
        title: "Error loading data",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Repository Dashboard</h1>
                <p className="text-muted-foreground">
                  All repositories stored in your database
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={loadStoredRepositories}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button asChild variant="default" size="sm">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Search
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          <RepositoryGrid
            repositories={repositories}
            isLoading={isLoading}
            error={error}
            hasSearched={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;