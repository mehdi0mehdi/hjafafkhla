import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { ToolCard } from '@/components/ToolCard';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import type { ToolWithButtons } from '@shared/schema';

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: tools, isLoading } = useQuery<ToolWithButtons[]>({
    queryKey: ['/api/tools'],
  });

  // Get all unique tags
  const allTags = Array.from(
    new Set(tools?.flatMap((tool) => tool.tags) || [])
  ).sort();

  // Filter tools based on search and selected tag
  const filteredTools = tools?.filter((tool) => {
    const matchesSearch = 
      !searchTerm ||
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.short_desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = !selectedTag || tool.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4" data-testid="text-page-title">
              Browse Tools
            </h1>
            <p className="text-lg text-muted-foreground">
              Discover essential gaming utilities and enhancements
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tools by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
                data-testid="input-search"
              />
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Filter className="w-4 h-4" />
                  Filter by tag:
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedTag === null ? 'default' : 'outline'}
                    className="cursor-pointer hover-elevate active-elevate-2"
                    onClick={() => setSelectedTag(null)}
                    data-testid="badge-filter-all"
                  >
                    All Tools
                  </Badge>
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? 'default' : 'outline'}
                      className="cursor-pointer hover-elevate active-elevate-2"
                      onClick={() => setSelectedTag(tag)}
                      data-testid={`badge-filter-${tag}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tools Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredTools && filteredTools.length > 0 ? (
            <>
              <div className="mb-6 text-sm text-muted-foreground">
                Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-card rounded-lg border border-card-border">
              <p className="text-lg text-muted-foreground mb-2" data-testid="text-no-results">
                No tools found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
