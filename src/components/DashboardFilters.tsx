import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { githubService } from '@/services/githubService';

interface DashboardFiltersProps {
  onFiltersChange: (filters: {
    searchTerm: string;
    languageFilter: string;
    sortBy: 'stargazers_count' | 'forks_count' | 'updated_at' | 'name';
    sortOrder: 'asc' | 'desc';
  }) => void;
  isLoading?: boolean;
}

const DashboardFilters = ({ onFiltersChange, isLoading = false }: DashboardFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'stargazers_count' | 'forks_count' | 'updated_at' | 'name'>('stargazers_count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadAvailableLanguages();
  }, []);

  // Debounced search effect
  useEffect(() => {
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      onFiltersChange({
        searchTerm,
        languageFilter,
        sortBy,
        sortOrder
      });
      setIsSearching(false);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timeoutId);
      setIsSearching(false);
    };
  }, [searchTerm, languageFilter, sortBy, sortOrder, onFiltersChange]);

  const loadAvailableLanguages = async () => {
    try {
      const languages = await githubService.getAvailableLanguages();
      setAvailableLanguages(languages);
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLanguageFilter('all');
    setSortBy('stargazers_count');
    setSortOrder('desc');
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isSearching ? 'text-primary animate-pulse' : 'text-muted-foreground'
            }`} />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* Language Filter */}
          <Select value={languageFilter} onValueChange={setLanguageFilter} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {availableLanguages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort By */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stargazers_count">Stars</SelectItem>
              <SelectItem value="forks_count">Forks</SelectItem>
              <SelectItem value="updated_at">Last Updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              disabled={isLoading}
              className="flex-1"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={isLoading}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardFilters; 