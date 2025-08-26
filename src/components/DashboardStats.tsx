import { useState, useEffect } from 'react';
import { Database, Star, GitFork, Code, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalRepositories: number;
  totalStars: number;
  totalForks: number;
  uniqueLanguages: number;
  uniqueOwners: number;
}

const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalRepositories: 0,
    totalStars: 0,
    totalForks: 0,
    uniqueLanguages: 0,
    uniqueOwners: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      
      // Get all repositories
      const { data, error } = await supabase
        .from('repositories')
        .select('stargazers_count, forks_count, language, owner_login');

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      if (data) {
        const totalStars = data.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const totalForks = data.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
        const uniqueLanguages = new Set(data.map(repo => repo.language).filter(Boolean)).size;
        const uniqueOwners = new Set(data.map(repo => repo.owner_login)).size;

        setStats({
          totalRepositories: data.length,
          totalStars,
          totalForks,
          uniqueLanguages,
          uniqueOwners
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalRepositories)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalStars)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
          <GitFork className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalForks)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Languages</CardTitle>
          <Code className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueLanguages}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Owners</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueOwners}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats; 