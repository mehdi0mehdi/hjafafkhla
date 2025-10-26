import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-8" data-testid="text-terms-title">
            Terms of Service
          </h1>

          <Card className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Important Notice</h2>
              <p className="text-foreground leading-relaxed bg-primary/10 border border-primary/20 rounded-lg p-4">
                <strong>This site hosts links to 3rd-party software and tools.</strong> Steam Family acts as a directory and community platform for third-party gaming tools. We do not develop, maintain, or directly distribute these tools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Acceptance of Terms</h2>
              <p className="text-foreground leading-relaxed">
                By accessing and using Steam Family, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">User Accounts</h2>
              <p className="text-foreground leading-relaxed mb-3">
                When creating an account, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Not share your account with others</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Tools Disclaimer</h2>
              <p className="text-foreground leading-relaxed mb-3">
                <strong>IMPORTANT:</strong> Steam Family provides links to third-party software and tools. We make no warranties or representations about:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                <li>The functionality, safety, or legality of third-party tools</li>
                <li>The accuracy of tool descriptions or user reviews</li>
                <li>The availability or continued support of linked tools</li>
                <li>Any damages resulting from the use of third-party tools</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-3">
                Use of any third-party tools is entirely at your own risk. Always review the terms, privacy policies, and source reputation of any tool before downloading.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">User-Generated Content</h2>
              <p className="text-foreground leading-relaxed mb-3">
                When posting reviews or other content, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                <li>Provide honest and accurate reviews based on your experience</li>
                <li>Not post offensive, defamatory, or illegal content</li>
                <li>Not spam or post promotional content</li>
                <li>Grant us the right to display and moderate your content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Prohibited Activities</h2>
              <p className="text-foreground leading-relaxed mb-3">
                You may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
                <li>Use the site for any illegal purpose</li>
                <li>Attempt to hack, disrupt, or compromise the platform</li>
                <li>Scrape or automatically collect data from the site</li>
                <li>Impersonate others or create fake accounts</li>
                <li>Submit malicious links or misleading information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Limitation of Liability</h2>
              <p className="text-foreground leading-relaxed">
                Steam Family is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform or any third-party tools accessed through our links.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Termination</h2>
              <p className="text-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Changes to Terms</h2>
              <p className="text-foreground leading-relaxed">
                We may update these Terms of Service at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
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
