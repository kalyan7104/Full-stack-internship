import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface SearchFormProps {
  onSearch: (keyword: string) => void;
  isLoading: boolean;
}

const SearchForm = ({ onSearch, isLoading }: SearchFormProps) => {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      onSearch(keyword.trim());
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card bg-gradient-card border-0">
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            GitHub Repository Explorer
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover and explore GitHub repositories by keyword
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search repositories (e.g., 'react', 'typescript', 'machine learning')"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 h-12 text-base border-2 focus:border-primary/50 transition-all"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!keyword.trim() || isLoading}
            className="h-12 px-8 bg-gradient-primary hover:shadow-elegant transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching
              </>
            ) : (
              'Search'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SearchForm;