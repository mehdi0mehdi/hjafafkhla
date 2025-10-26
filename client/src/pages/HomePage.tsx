import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { ToolCard } from '@/components/ToolCard';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Download, Users, Shield, ArrowRight } from 'lucide-react';
import type { ToolWithButtons } from '@shared/schema';

export default function HomePage() {
  const { data: tools, isLoading } = useQuery<ToolWithButtons[]>({
    queryKey: ['/api/tools/featured'],
  });

  const features = [
    {
      icon: Shield,
      title: 'Community Trusted',
      description: 'Tools vetted and reviewed by gamers like you',
    },
    {
      icon: Download,
      title: 'Easy Access',
      description: 'Quick downloads with direct links to tool providers',
    },
    {
      icon: Users,
      title: 'Active Community',
      description: 'Join discussions and share your experiences',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="block text-foreground">Welcome to</span>
              <span className="block text-primary mt-2" data-testid="text-hero-title">SteamFamily</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-muted-foreground leading-relaxed">
              A collection of community tools for gamers
            </p>

            <p className="max-w-3xl mx-auto text-base md:text-lg text-muted-foreground/80">
              Discover powerful tools to enhance your gaming experience
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/tools">
                <Button size="lg" className="text-base px-8 group" data-testid="button-explore-tools">
                  Explore Tools
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/tools">
                <Button size="lg" variant="outline" className="text-base px-8" data-testid="button-join-community">
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose <span className="text-primary">SteamFamily</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-lg p-8 border border-card-border hover-elevate active-elevate-2 transition-all"
                data-testid={`card-feature-${index}`}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Featured Tools
            </h2>
            <Link href="/tools">
              <Button variant="outline" data-testid="button-view-all">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : tools && tools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.slice(0, 6).map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground" data-testid="text-no-tools">
                No tools available yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Steam Family is a community-driven platform sharing useful third-party gaming tools and utilities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/tools">
                    <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      Browse Tools
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy">
                    <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-privacy">
                      Privacy Policy
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-terms">
                      Terms of Service
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Steam Family. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
