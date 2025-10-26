import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Download, Star, BarChart3, Eye } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { getAuthToken } from '@/lib/supabase';
import { useLocation } from 'wouter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ToolWithButtons } from '@shared/schema';

interface DownloadButton {
  label: string;
  url: string;
  order: number;
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showToolModal, setShowToolModal] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolWithButtons | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [descriptionMarkdown, setDescriptionMarkdown] = useState('');
  const [images, setImages] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>(['']);
  const [donationUrl, setDonationUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [downloadButtons, setDownloadButtons] = useState<DownloadButton[]>([
    { label: '', url: '', order: 0 },
  ]);

  const { data: tools = [] } = useQuery<ToolWithButtons[]>({
    queryKey: ['/api/admin/tools'],
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  if (!isAdmin) {
    setLocation('/');
    return null;
  }

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setShortDesc('');
    setDescriptionMarkdown('');
    setImages(['']);
    setTags(['']);
    setDonationUrl('');
    setTelegramUrl('');
    setDownloadButtons([{ label: '', url: '', order: 0 }]);
    setEditingTool(null);
  };

  const openEditModal = (tool: ToolWithButtons) => {
    setEditingTool(tool);
    setTitle(tool.title);
    setSlug(tool.slug);
    setShortDesc(tool.short_desc);
    setDescriptionMarkdown(tool.description_markdown);
    setImages(tool.images.length > 0 ? tool.images : ['']);
    setTags(tool.tags.length > 0 ? tool.tags : ['']);
    setDonationUrl(tool.donation_url || '');
    setTelegramUrl(tool.telegram_url || '');
    setDownloadButtons(
      tool.download_buttons.length > 0
        ? tool.download_buttons.map((b) => ({ label: b.label, url: b.url, order: b.order }))
        : [{ label: '', url: '', order: 0 }]
    );
    setShowToolModal(true);
  };

  const createToolMutation = useMutation({
    mutationFn: async (toolData: any) => {
      const token = await getAuthToken();
      return apiRequest('POST', '/api/admin/tools', toolData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      toast({ title: 'Success', description: 'Tool created successfully!' });
      resetForm();
      setShowToolModal(false);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create tool' });
    },
  });

  const updateToolMutation = useMutation({
    mutationFn: async ({ id, toolData }: { id: string; toolData: any }) => {
      const token = await getAuthToken();
      return apiRequest('PUT', `/api/admin/tools/${id}`, toolData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      toast({ title: 'Success', description: 'Tool updated successfully!' });
      resetForm();
      setShowToolModal(false);
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update tool' });
    },
  });

  const deleteToolMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAuthToken();
      return apiRequest('DELETE', `/api/admin/tools/${id}`, undefined, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      toast({ title: 'Success', description: 'Tool deleted successfully!' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete tool' });
    },
  });

  const handleSubmit = () => {
    const filteredImages = images.filter((img) => img.trim() !== '');
    const filteredTags = tags.filter((tag) => tag.trim() !== '');
    const filteredButtons = downloadButtons.filter((btn) => btn.label.trim() && btn.url.trim());

    const toolData = {
      title,
      slug,
      short_desc: shortDesc,
      description_markdown: descriptionMarkdown,
      images: filteredImages,
      tags: filteredTags,
      donation_url: donationUrl || null,
      telegram_url: telegramUrl || null,
      downloadButtons: filteredButtons.map((btn, idx) => ({ ...btn, order: idx })),
    };

    if (editingTool) {
      updateToolMutation.mutate({ id: editingTool.id, toolData });
    } else {
      createToolMutation.mutate(toolData);
    }
  };

  const addImage = () => setImages([...images, '']);
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));
  const updateImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addTag = () => setTags([...tags, '']);
  const removeTag = (index: number) => setTags(tags.filter((_, i) => i !== index));
  const updateTag = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const addDownloadButton = () =>
    setDownloadButtons([...downloadButtons, { label: '', url: '', order: downloadButtons.length }]);
  const removeDownloadButton = (index: number) =>
    setDownloadButtons(downloadButtons.filter((_, i) => i !== index));
  const updateDownloadButton = (index: number, field: 'label' | 'url', value: string) => {
    const newButtons = [...downloadButtons];
    newButtons[index][field] = value;
    setDownloadButtons(newButtons);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-foreground mb-2" data-testid="text-admin-title">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Manage tools, reviews, and site content</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowToolModal(true);
              }}
              size="lg"
              data-testid="button-create-tool"
            >
              <Plus className="mr-2 w-5 h-5" />
              Add New Tool
            </Button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Total Tools</span>
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-extrabold text-primary" data-testid="text-stat-tools">
                  {stats.totalTools || 0}
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Total Downloads</span>
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-extrabold text-foreground" data-testid="text-stat-downloads">
                  {stats.totalDownloads || 0}
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Total Reviews</span>
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-extrabold text-foreground" data-testid="text-stat-reviews">
                  {stats.totalReviews || 0}
                </div>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-muted-foreground">Avg Rating</span>
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="text-3xl font-extrabold text-foreground" data-testid="text-stat-avg-rating">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </div>
              </Card>
            </div>
          )}

          {/* Tools List */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Manage Tools</h2>
            <div className="space-y-4">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-4 bg-accent rounded-lg border border-border hover-elevate"
                  data-testid={`row-tool-${tool.id}`}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-1">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{tool.short_desc}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tool.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setLocation(`/tool/${tool.slug}`)}
                      data-testid={`button-view-${tool.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditModal(tool)}
                      data-testid={`button-edit-${tool.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${tool.title}"?`)) {
                          deleteToolMutation.mutate(tool.id);
                        }
                      }}
                      data-testid={`button-delete-${tool.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {tools.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No tools yet. Create your first tool to get started!
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Create/Edit Tool Modal */}
      <Dialog open={showToolModal} onOpenChange={(open) => { if (!open) resetForm(); setShowToolModal(open); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-tool-form">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingTool ? 'Edit Tool' : 'Create New Tool'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tool name"
                  data-testid="input-title"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="tool-url-slug"
                  data-testid="input-slug"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="shortDesc">Short Description *</Label>
              <Input
                id="shortDesc"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief description (10+ characters)"
                data-testid="input-short-desc"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="descriptionMarkdown">Full Description (Markdown) *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  data-testid="button-toggle-preview"
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Textarea
                  id="descriptionMarkdown"
                  value={descriptionMarkdown}
                  onChange={(e) => setDescriptionMarkdown(e.target.value)}
                  placeholder="Full description with markdown support..."
                  rows={8}
                  data-testid="input-markdown"
                />
                {showPreview && (
                  <div className="prose prose-invert max-w-none bg-accent p-4 rounded-lg border border-border" data-testid="preview-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {descriptionMarkdown || '*Preview will appear here...*'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Images (URLs)</Label>
              {images.map((img, idx) => (
                <div key={idx} className="flex gap-2 mt-2">
                  <Input
                    value={img}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    data-testid={`input-image-${idx}`}
                  />
                  {images.length > 1 && (
                    <Button variant="outline" size="icon" onClick={() => removeImage(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addImage} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </div>

            <div>
              <Label>Tags</Label>
              {tags.map((tag, idx) => (
                <div key={idx} className="flex gap-2 mt-2">
                  <Input
                    value={tag}
                    onChange={(e) => updateTag(idx, e.target.value)}
                    placeholder="Tag name"
                    data-testid={`input-tag-${idx}`}
                  />
                  {tags.length > 1 && (
                    <Button variant="outline" size="icon" onClick={() => removeTag(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
            </div>

            <div>
              <Label>Download Buttons *</Label>
              {downloadButtons.map((btn, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-2 mt-2">
                  <Input
                    value={btn.label}
                    onChange={(e) => updateDownloadButton(idx, 'label', e.target.value)}
                    placeholder="Button label (e.g., Download Now)"
                    data-testid={`input-button-label-${idx}`}
                  />
                  <div className="flex gap-2">
                    <Input
                      value={btn.url}
                      onChange={(e) => updateDownloadButton(idx, 'url', e.target.value)}
                      placeholder="https://..."
                      data-testid={`input-button-url-${idx}`}
                    />
                    {downloadButtons.length > 1 && (
                      <Button variant="outline" size="icon" onClick={() => removeDownloadButton(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addDownloadButton} className="mt-2">
                <Plus className="w-4 h-4 mr-2" />
                Add Download Button
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="donationUrl">Donation URL (optional)</Label>
                <Input
                  id="donationUrl"
                  value={donationUrl}
                  onChange={(e) => setDonationUrl(e.target.value)}
                  placeholder="https://..."
                  data-testid="input-donation-url"
                />
              </div>
              <div>
                <Label htmlFor="telegramUrl">Telegram URL (optional)</Label>
                <Input
                  id="telegramUrl"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/..."
                  data-testid="input-telegram-url"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={createToolMutation.isPending || updateToolMutation.isPending}
                className="flex-1"
                data-testid="button-submit-tool"
              >
                {editingTool ? 'Update Tool' : 'Create Tool'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowToolModal(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
