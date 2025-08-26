import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import RepositoryGrid from '@/components/RepositoryGrid';
import Pagination from '@/components/Pagination';
import DashboardFilters from '@/components/DashboardFilters';
import DashboardStats from '@/components/DashboardStats';
import TopicsList from '@/components/TopicsList';
import { Repository } from '@/components/RepositoryCard';
import { githubService } from '@/services/githubService';
import { Button } from '@/components/ui/button';
import { Database, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    searchTerm: '',
    languageFilter: 'all',
    sortBy: 'stargazers_count' as const,
    sortOrder: 'desc' as const
  });
  const { toast } = useToast();

  const loadStoredRepositories = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await githubService.getAllStoredRepositories(
        page,
        12,
        filters.searchTerm,
        filters.languageFilter,
        filters.sortBy,
        filters.sortOrder
      );
      
      setRepositories(result.repositories);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
      setCurrentPage(page);
      
      if (result.repositories.length === 0) {
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
  }, [filters, toast]);

  useEffect(() => {
    loadStoredRepositories(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    loadStoredRepositories(page);
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
                onClick={() => loadStoredRepositories(1)}
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

        {/* Stats */}
        <DashboardStats />

        {/* Filters */}
        <DashboardFilters
          onFiltersChange={handleFiltersChange}
          isLoading={isLoading}
        />

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <RepositoryGrid
                repositories={repositories}
                isLoading={isLoading}
                error={error}
                hasSearched={true}
              />
              
              {/* Pagination */}
              {!isLoading && !error && repositories.length > 0 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    hasNextPage={currentPage < totalPages}
                    hasPrevPage={currentPage > 1}
                    totalItems={totalCount}
                    itemsPerPage={12}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <TopicsList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;