import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface TopicCount {
  topic: string;
  count: number;
}

const TopicsList = () => {
  const [topics, setTopics] = useState<TopicCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPopularTopics();
  }, []);

  const loadPopularTopics = async () => {
    try {
      setIsLoading(true);
      
      // Get all repositories with topics
      const { data, error } = await supabase
        .from('repositories')
        .select('topics')
        .not('topics', 'is', null);

      if (error) {
        console.error('Error fetching topics:', error);
        return;
      }

      // Count topic occurrences
      const topicCounts: { [key: string]: number } = {};
      
      data?.forEach(repo => {
        if (repo.topics && Array.isArray(repo.topics)) {
          repo.topics.forEach(topic => {
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;
          });
        }
      });

      // Convert to array and sort by count
      const topicsArray = Object.entries(topicCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Show top 20 topics

      setTopics(topicsArray);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Popular Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-6 w-16 bg-muted rounded animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Popular Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No topics found in stored repositories
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Popular Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {topics.map(({ topic, count }) => (
            <Badge
              key={topic}
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
            >
              {topic}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicsList; 