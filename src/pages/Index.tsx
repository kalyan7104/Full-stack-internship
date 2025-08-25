import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import SearchForm from '@/components/SearchForm';
import RepositoryGrid from '@/components/RepositoryGrid';
import { Repository } from '@/components/RepositoryCard';
import { githubService } from '@/services/githubService';
import { Button } from '@/components/ui/button';
import { Database, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await githubService.searchRepositories({
        query: keyword,
        page: 1,
        perPage: 12,
        sort: 'stars',
        order: 'desc'
      });

      setRepositories(response.items);
      
      if (response.items.length === 0) {
        toast({
          title: "No results found",
          description: `No repositories found for "${keyword}". Try different keywords.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Search completed & saved",
          description: `Found ${response.items.length} repositories for "${keyword}" and saved to database`,
          variant: "default"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setRepositories([]);
      
      toast({
        title: "Search failed",
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
        <div className="mb-12">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-center">
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">
                <Database className="h-4 w-4 mr-2" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Results Info */}
        {repositories.length > 0 && hasSearched && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              Showing live search results (saved to database)
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          <RepositoryGrid
            repositories={repositories}
            isLoading={isLoading}
            error={error}
            hasSearched={hasSearched}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;