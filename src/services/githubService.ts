import { Repository } from '@/components/RepositoryCard';
import { supabase } from '@/integrations/supabase/client';

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Repository[];
}

interface SearchParams {
  query: string;
  page?: number;
  perPage?: number;
  sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
  order?: 'desc' | 'asc';
}

interface SearchResponse {
  items: Repository[];
  total_count: number;
  incomplete_results: boolean;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

class GitHubService {
  private readonly baseUrl = 'https://api.github.com';
  
  async searchRepositories({
    query,
    page = 1,
    perPage = 12,
    sort = 'stars',
    order = 'desc'
  }: SearchParams): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      per_page: perPage.toString(),
      sort,
      order
    });

    try {
      const response = await fetch(`${this.baseUrl}/search/repositories?${params}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Repo-Explorer'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('API rate limit exceeded. Please try again later.');
        }
        if (response.status === 422) {
          throw new Error('Invalid search query. Please try different keywords.');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const data: GitHubSearchResponse = await response.json();
      
      // Calculate pagination info
      const totalPages = Math.ceil(data.total_count / perPage);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      
      // Store results in Supabase database
      if (data.items?.length > 0) {
        await this.saveRepositoriesToDatabase(data.items, query);
      }
      
      return {
        ...data,
        currentPage: page,
        totalPages,
        hasNextPage,
        hasPrevPage
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch repositories. Please check your connection and try again.');
    }
  }

  private async saveRepositoriesToDatabase(repositories: Repository[], searchKeyword: string) {
    try {
      const repositoriesData = repositories.map(repo => ({
        github_id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        clone_url: repo.html_url, // Using html_url as fallback
        ssh_url: repo.html_url, // Using html_url as fallback
        homepage: repo.html_url, // Using html_url as fallback
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        forks_count: repo.forks_count,
        open_issues_count: 0, // Default value
        size: 0, // Default value
        default_branch: 'main', // Default value
        topics: repo.topics || [],
        owner_login: repo.owner.login,
        owner_type: 'User', // Default value
        owner_avatar_url: repo.owner.avatar_url,
        pushed_at: repo.updated_at,
        search_keyword: searchKeyword,
        archived: false, // Default value
        disabled: false, // Default value
        private: false, // Default value
        fork: false, // Default value
      }));

      const { error } = await supabase
        .from('repositories')
        .upsert(repositoriesData, { 
          onConflict: 'github_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error saving repositories to database:', error);
      }
    } catch (error) {
      console.error('Error saving repositories to database:', error);
    }
  }

  async getAllStoredRepositories(
    page: number = 1,
    perPage: number = 12,
    searchTerm?: string,
    languageFilter?: string,
    sortBy: 'stargazers_count' | 'forks_count' | 'updated_at' | 'name' = 'stargazers_count',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<{ repositories: Repository[]; total: number; currentPage: number; totalPages: number }> {
    try {
      let query = supabase
        .from('repositories')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,owner_login.ilike.%${searchTerm}%`);
      }

      // Apply language filter
      if (languageFilter && languageFilter !== 'all') {
        query = query.eq('language', languageFilter);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching stored repositories:', error);
        return { repositories: [], total: 0, currentPage: page, totalPages: 0 };
      }

      const repositories = data?.map(repo => ({
        id: repo.github_id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        forks_count: repo.forks_count,
        language: repo.language,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        owner: {
          login: repo.owner_login,
          avatar_url: repo.owner_avatar_url,
          html_url: repo.html_url,
        },
        topics: repo.topics || [],
      })) || [];

      const total = count || 0;
      const totalPages = Math.ceil(total / perPage);

      return { repositories, total, currentPage: page, totalPages };
    } catch (error) {
      console.error('Error fetching stored repositories:', error);
      return { repositories: [], total: 0, currentPage: page, totalPages: 0 };
    }
  }

  async getAvailableLanguages(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('repositories')
        .select('language')
        .not('language', 'is', null);

      if (error) {
        console.error('Error fetching languages:', error);
        return [];
      }

      const languages = [...new Set(data?.map(repo => repo.language).filter(Boolean))];
      return languages.sort();
    } catch (error) {
      console.error('Error fetching languages:', error);
      return [];
    }
  }

  async getRepositoryById(id: number): Promise<Repository> {
    try {
      const response = await fetch(`${this.baseUrl}/repositories/${id}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Repo-Explorer'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repository: ${response.status} ${response.statusText}`);
      }

      const data: Repository = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch repository details.');
    }
  }
}

export const githubService = new GitHubService();