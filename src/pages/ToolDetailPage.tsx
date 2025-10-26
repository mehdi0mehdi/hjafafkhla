import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Download, Heart, MessageCircle, Star, ExternalLink } from 'lucide-react';
import { SiTelegram } from 'react-icons/si';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { ToolWithButtons, ReviewWithUser } from '@shared/schema';

export default function ToolDetailPage() {
  const [, params] = useRoute('/tool/:slug');
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [donatePopupShown, setDonatePopupShown] = useState(false);
  const [telegramPopupShown, setTelegramPopupShown] = useState(false);
  const [showDonatePopup, setShowDonatePopup] = useState(false);
  const [showTelegramPopup, setShowTelegramPopup] = useState(false);

  const { data: tool, isLoading } = useQuery<ToolWithButtons>({
    queryKey: ['/api/tools', params?.slug],
    enabled: !!params?.slug,
  });

  const { data: reviews = [] } = useQuery<ReviewWithUser[]>({
    queryKey: ['/api/reviews', tool?.id],
    enabled: !!tool?.id,
  });

  // Check session storage for popups on mount
  useEffect(() => {
    if (tool) {
      const donateShown = sessionStorage.getItem(`donate-shown-${tool.id}`);
      const telegramShown = sessionStorage.getItem(`telegram-shown-${tool.id}`);
      
      if (donateShown) {
        setDonatePopupShown(true);
      }
      if (telegramShown) {
        setTelegramPopupShown(true);
      }
    }
  }, [tool]);

  const downloadMutation = useMutation({
    mutationFn: async (data: { tool_id: string; button_label: string; url: string }) => {
      await apiRequest('POST', '/api/downloads', data);
      return data.url;
    },
    onSuccess: (url) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', params?.slug] });
      window.open(url, '_blank');
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to download tools.',
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: { tool_id: string; rating: number; review_text: string }) => {
      return apiRequest('POST', '/api/reviews', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews', tool?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/tools', params?.slug] });
      setReviewText('');
      setRating(5);
      toast({
        title: 'Review submitted',
        description: 'Thank you for your feedback!',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to submit review.',
      });
    },
  });

  const handleDownload = (buttonLabel: string, url: string) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Login required',
        description: 'Please sign in to download tools.',
      });
      return;
    }

    if (!tool) return;

    downloadMutation.mutate({
      tool_id: tool.id,
      button_label: buttonLabel,
      url,
    });
  };

  const handleDonateClick = () => {
    if (!tool) return;
    
    // Check if popup was already shown this session
    const alreadyShown = sessionStorage.getItem(`donate-shown-${tool.id}`);
    
    if (!alreadyShown) {
      // First time this session - show popup and mark as shown
      sessionStorage.setItem(`donate-shown-${tool.id}`, 'true');
      setDonatePopupShown(true);
      setShowDonatePopup(true);
    } else {
      // Already shown this session - go directly to URL
      if (tool.donation_url) {
        window.open(tool.donation_url, '_blank');
      }
    }
  };

  const handleTelegramClick = () => {
    if (!tool) return;
    
    // Check if popup was already shown this session
    const alreadyShown = sessionStorage.getItem(`telegram-shown-${tool.id}`);
    
    if (!alreadyShown) {
      // First time this session - show popup and mark as shown
      sessionStorage.setItem(`telegram-shown-${tool.id}`, 'true');
      setTelegramPopupShown(true);
      setShowTelegramPopup(true);
    } else {
      // Already shown this session - go directly to URL
      if (tool.telegram_url) {
        window.open(tool.telegram_url, '_blank');
      }
    }
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Login required',
        description: 'Please sign in to submit a review.',
      });
      return;
    }

    if (!tool || reviewText.length < 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid review',
        description: 'Review must be at least 10 characters long.',
      });
      return;
    }

    reviewMutation.mutate({
      tool_id: tool.id,
      rating,
      review_text: reviewText,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-96 bg-card rounded-lg" />
              <div className="h-64 bg-card rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Tool not found</h1>
            <p className="text-muted-foreground">The tool you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const images = tool.images.length > 0 ? tool.images : ['https://placehold.co/1200x675/1a1a1a/ef4444?text=No+Image'];
  const averageRating = tool.average_rating || 0;
  const reviewCount = tool.review_count || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tool Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
            {/* Left: Image Gallery (60%) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-card">
                <img
                  src={images[selectedImage]}
                  alt={tool.title}
                  className="w-full h-full object-cover"
                  data-testid="img-tool-main"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-transparent hover-elevate'
                      }`}
                      data-testid={`button-image-${index}`}
                    >
                      <img src={img} alt={`${tool.title} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Tool Info & Actions (40%) */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" data-testid="text-tool-title">
                  {tool.title}
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-tool-desc">
                  {tool.short_desc}
                </p>
              </div>

              {/* Tags */}
              {tool.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tool.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" data-testid={`badge-tag-${index}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Rating */}
              {reviewCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-card-border">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(averageRating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold" data-testid="text-average-rating">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Download Buttons */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">Download Options</h3>
                {tool.download_buttons.map((button, index) => (
                  <Button
                    key={button.id}
                    onClick={() => handleDownload(button.label, button.url)}
                    disabled={downloadMutation.isPending}
                    className="w-full text-base h-12"
                    data-testid={`button-download-${index}`}
                  >
                    <Download className="mr-2 w-5 h-5" />
                    {button.label}
                  </Button>
                ))}
              </div>

              {/* Donate & Telegram Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                {tool.donation_url && (
                  <Button
                    variant="outline"
                    onClick={handleDonateClick}
                    className="h-12"
                    data-testid="button-donate"
                  >
                    <Heart className="mr-2 w-4 h-4" />
                    Donate
                  </Button>
                )}
                {tool.telegram_url && (
                  <Button
                    variant="outline"
                    onClick={handleTelegramClick}
                    className="h-12"
                    data-testid="button-telegram"
                  >
                    <SiTelegram className="mr-2 w-4 h-4" />
                    Telegram
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Description</h2>
            <div className="prose prose-invert max-w-none" data-testid="text-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {tool.description_markdown}
              </ReactMarkdown>
            </div>
          </Card>

          {/* Reviews Section */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-foreground">Reviews</h2>

            {/* Submit Review */}
            {user && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">Write a Review</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Your Rating</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => setRating(value)}
                          className="focus:outline-none"
                          data-testid={`button-rating-${value}`}
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              value <= rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted hover:text-yellow-500'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="review">Your Review (minimum 10 characters)</Label>
                    <Textarea
                      id="review"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with this tool..."
                      rows={4}
                      className="mt-2"
                      data-testid="input-review"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={reviewMutation.isPending || reviewText.length < 10}
                    data-testid="button-submit-review"
                  >
                    <MessageCircle className="mr-2 w-4 h-4" />
                    Submit Review
                  </Button>
                </div>
              </Card>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6" data-testid={`card-review-${review.id}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {review.user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground" data-testid={`text-reviewer-${review.id}`}>
                            {review.user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-foreground leading-relaxed" data-testid={`text-review-${review.id}`}>
                      {review.review_text}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No reviews yet. Be the first to review this tool!</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Donate Popup */}
      <Dialog open={showDonatePopup} onOpenChange={setShowDonatePopup}>
        <DialogContent data-testid="modal-donate">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Support the Developer</DialogTitle>
            <DialogDescription>
              Your donation helps support the continued development of this tool.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-foreground">
              Thank you for considering a donation! Click below to visit the donation page.
            </p>
            <Button
              onClick={() => {
                if (tool.donation_url) {
                  window.open(tool.donation_url, '_blank');
                }
                setShowDonatePopup(false);
              }}
              className="w-full"
              data-testid="button-donate-confirm"
            >
              <ExternalLink className="mr-2 w-4 h-4" />
              Go to Donation Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Telegram Popup */}
      <Dialog open={showTelegramPopup} onOpenChange={setShowTelegramPopup}>
        <DialogContent data-testid="modal-telegram">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Join Telegram Community</DialogTitle>
            <DialogDescription>
              Connect with other users and get support from the community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-foreground">
              Join the Telegram group to discuss this tool, get help, and stay updated.
            </p>
            <Button
              onClick={() => {
                if (tool.telegram_url) {
                  window.open(tool.telegram_url, '_blank');
                }
                setShowTelegramPopup(false);
              }}
              className="w-full"
              data-testid="button-telegram-confirm"
            >
              <SiTelegram className="mr-2 w-4 h-4" />
              Open Telegram
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
