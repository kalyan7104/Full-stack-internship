-- Create repositories table to store GitHub search results
CREATE TABLE public.repositories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  github_id bigint NOT NULL UNIQUE,
  name text NOT NULL,
  full_name text NOT NULL,
  description text,
  html_url text NOT NULL,
  clone_url text NOT NULL,
  ssh_url text NOT NULL,
  homepage text,
  language text,
  stargazers_count integer NOT NULL DEFAULT 0,
  watchers_count integer NOT NULL DEFAULT 0,
  forks_count integer NOT NULL DEFAULT 0,
  open_issues_count integer NOT NULL DEFAULT 0,
  size integer NOT NULL DEFAULT 0,
  default_branch text NOT NULL DEFAULT 'main',
  topics text[],
  owner_login text NOT NULL,
  owner_type text NOT NULL,
  owner_avatar_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  pushed_at timestamp with time zone,
  search_keyword text NOT NULL,
  archived boolean NOT NULL DEFAULT false,
  disabled boolean NOT NULL DEFAULT false,
  private boolean NOT NULL DEFAULT false,
  fork boolean NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a demo app)
CREATE POLICY "Repositories are viewable by everyone" 
ON public.repositories 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create repositories" 
ON public.repositories 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update repositories" 
ON public.repositories 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete repositories" 
ON public.repositories 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_repositories_updated_at
BEFORE UPDATE ON public.repositories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_repositories_search_keyword ON public.repositories(search_keyword);
CREATE INDEX idx_repositories_github_id ON public.repositories(github_id);
CREATE INDEX idx_repositories_stargazers ON public.repositories(stargazers_count DESC);