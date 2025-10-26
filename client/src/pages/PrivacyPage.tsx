import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-8" data-testid="text-privacy-title">
            Privacy Policy
          </h1>

          <Card className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Important Notice</h2>
              <p className="text-foreground leading-relaxed bg-primary/10 border border-primary/20 rounded-lg p-4">
                <strong>This site hosts links to 3rd-party software and tools.</strong> Steam Family is a community platform that shares links to external gaming utilities and software created by third-party developers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
              <p className="text-foreground leading-relaxed mb-3">
                When you use Steam Family, we may collect the following information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                <li>Account information (email, username) when you register</li>
                <li>Download history and tool interactions</li>
                <li>Reviews and ratings you submit</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
              <p className="text-foreground leading-relaxed mb-3">
                We use collected information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                <li>Provide and improve our services</li>
                <li>Track download statistics and popular tools</li>
                <li>Display your reviews and ratings</li>
                <li>Send important service notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Tools</h2>
              <p className="text-foreground leading-relaxed">
                Steam Family provides links to third-party tools and software. We are not responsible for the privacy practices or content of these external sites. Please review the privacy policies of any third-party tools before downloading or using them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
              <p className="text-foreground leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-foreground leading-relaxed">
                If you have questions about this Privacy Policy, please contact us through our support channels.
              </p>
            </section>

            <p className="text-sm text-muted-foreground pt-6 border-t border-border">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
