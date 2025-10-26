import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Star } from 'lucide-react';
import type { ToolWithButtons } from '@shared/schema';

interface ToolCardProps {
  tool: ToolWithButtons;
}

export function ToolCard({ tool }: ToolCardProps) {
  const primaryImage = tool.images[0] || 'https://placehold.co/800x450/1a1a1a/ef4444?text=No+Image';
  const downloadCount = tool.download_count || 0;
  const averageRating = tool.average_rating || 0;
  const reviewCount = tool.review_count || 0;

  return (
    <Link href={`/tool/${tool.slug}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all duration-200 cursor-pointer group" data-testid={`card-tool-${tool.id}`}>
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-accent">
          <img
            src={primaryImage}
            alt={tool.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`img-tool-${tool.id}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Download Count Overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm font-semibold text-white" data-testid={`text-downloads-${tool.id}`}>
              {downloadCount.toLocaleString()}
            </span>
          </div>

          {/* Rating Overlay */}
          {reviewCount > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-white" data-testid={`text-rating-${tool.id}`}>
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="text-xl font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors" data-testid={`text-title-${tool.id}`}>
            {tool.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" data-testid={`text-desc-${tool.id}`}>
            {tool.short_desc}
          </p>

          {/* Tags */}
          {tool.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {tool.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs" data-testid={`badge-tag-${tool.id}-${index}`}>
                  {tag}
                </Badge>
              ))}
              {tool.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tool.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
