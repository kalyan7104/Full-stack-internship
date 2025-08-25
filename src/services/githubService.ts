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

class GitHubService {
  private readonly baseUrl = 'https://api.github.com';
  
  async searchRepositories({
    query,
    page = 1,
    perPage = 12,
    sort = 'stars',
    order = 'desc'
  }: SearchParams): Promise<GitHubSearchResponse> {
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
      
      // Store results in Supabase database
      if (data.items?.length > 0) {
        await this.saveRepositoriesToDatabase(data.items, query);
      }
      
      return data;
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

  async getAllStoredRepositories(): Promise<Repository[]> {
    try {
      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .order('stargazers_count', { ascending: false });

      if (error) {
        console.error('Error fetching stored repositories:', error);
        return [];
      }

      return data?.map(repo => ({
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
          html_url: repo.html_url, // Using repo html_url as fallback
        },
        topics: repo.topics || [],
      })) || [];
    } catch (error) {
      console.error('Error fetching stored repositories:', error);
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