import { AlertCircle, Search } from 'lucide-react';
import RepositoryCard, { Repository } from './RepositoryCard';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RepositoryGridProps {
  repositories: Repository[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
}

const RepositoryGrid = ({ repositories, isLoading, error, hasSearched }: RepositoryGridProps) => {
  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto border-destructive/50 bg-destructive/5">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-destructive font-medium">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!hasSearched && !isLoading) {
    return (
      <div className="text-center py-16">
        <Search className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          Ready to explore GitHub?
        </h3>
        <p className="text-muted-foreground">
          Enter a keyword above to discover amazing repositories
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-64 bg-gradient-card rounded-lg border animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (repositories.length === 0 && hasSearched) {
    return (
      <div className="text-center py-16">
        <Search className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
          No repositories found
        </h3>
        <p className="text-muted-foreground">
          Try searching with different keywords or check your spelling
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Found {repositories.length} repositories
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repositories.map((repository) => (
          <RepositoryCard key={repository.id} repository={repository} />
        ))}
      </div>
    </div>
  );
};

export default RepositoryGrid;