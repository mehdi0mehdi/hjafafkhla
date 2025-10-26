import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from './AuthModal';
import { Menu, X, Gamepad2 } from 'lucide-react';

export function Header() {
  const [, setLocation] = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setLocation('/');
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-3 py-2 -ml-3">
              <Gamepad2 className="w-7 h-7 md:w-8 md:h-8 text-primary" data-testid="icon-logo" />
              <span className="text-xl md:text-2xl font-extrabold">
                <span className="text-foreground">Steam</span>
                <span className="text-primary">Family</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <span className="text-base font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-home">
                  Home
                </span>
              </Link>
              <Link href="/tools">
                <span className="text-base font-semibold text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-tools">
                  Tools
                </span>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <span className="text-base font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer" data-testid="link-admin">
                    Admin
                  </span>
                </Link>
              )}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground" data-testid="text-username">
                    {user.email}
                  </span>
                  <Button variant="outline" onClick={handleSignOut} data-testid="button-signout">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => openAuthModal('signin')} data-testid="button-login">
                    Login
                  </Button>
                  <Button variant="default" onClick={() => openAuthModal('signup')} data-testid="button-register">
                    Register
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="px-4 py-4 space-y-3">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <div className="text-base font-semibold text-foreground hover:text-primary transition-colors py-2 cursor-pointer" data-testid="link-mobile-home">
                  Home
                </div>
              </Link>
              <Link href="/tools" onClick={() => setMobileMenuOpen(false)}>
                <div className="text-base font-semibold text-foreground hover:text-primary transition-colors py-2 cursor-pointer" data-testid="link-mobile-tools">
                  Tools
                </div>
              </Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <div className="text-base font-semibold text-primary hover:text-primary/80 transition-colors py-2 cursor-pointer" data-testid="link-mobile-admin">
                    Admin
                  </div>
                </Link>
              )}
              <div className="pt-3 border-t border-border space-y-2">
                {user ? (
                  <>
                    <div className="text-sm text-muted-foreground py-2" data-testid="text-mobile-username">
                      {user.email}
                    </div>
                    <Button variant="outline" onClick={handleSignOut} className="w-full" data-testid="button-mobile-signout">
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => openAuthModal('signin')} className="w-full" data-testid="button-mobile-login">
                      Login
                    </Button>
                    <Button variant="default" onClick={() => openAuthModal('signup')} className="w-full" data-testid="button-mobile-register">
                      Register
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onSwitchMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
      />
    </>
  );
}
