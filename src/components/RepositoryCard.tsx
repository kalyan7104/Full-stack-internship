import { Star, GitFork, Eye, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  topics: string[];
}

interface RepositoryCardProps {
  repository: Repository;
}

const RepositoryCard = ({ repository }: RepositoryCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Card className="h-full hover:shadow-elegant transition-all duration-300 bg-gradient-card border-0 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={repository.owner.avatar_url}
              alt={`${repository.owner.login} avatar`}
              className="w-10 h-10 rounded-full ring-2 ring-primary/20"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                {repository.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {repository.owner.login}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="shrink-0 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View
            </a>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {repository.description || 'No description available'}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {formatNumber(repository.stargazers_count)}
          </div>
          <div className="flex items-center gap-1">
            <GitFork className="h-4 w-4" />
            {formatNumber(repository.forks_count)}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {formatNumber(repository.watchers_count)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {repository.language && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {repository.language}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Updated {formatDate(repository.updated_at)}
          </div>
        </div>

        {repository.topics && repository.topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repository.topics.slice(0, 3).map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                className="text-xs bg-accent/10 text-accent border-accent/30"
              >
                {topic}
              </Badge>
            ))}
            {repository.topics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{repository.topics.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RepositoryCard;