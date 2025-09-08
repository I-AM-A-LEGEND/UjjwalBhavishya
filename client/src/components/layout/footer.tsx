import { ExternalLink } from "lucide-react";

export function Footer() {
  const quickLinks = [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" }
  ];

  const governmentPortals = [
    { label: "myScheme.gov.in", href: "https://www.myscheme.gov.in" },
    { label: "API Setu", href: "https://apisetu.gov.in" },
    { label: "Open Government Data", href: "https://www.data.gov.in" },
    { label: "Digital India", href: "https://www.digitalindia.gov.in" }
  ];

  const socialLinks = [
    { label: "Twitter", href: "#", icon: "fab fa-twitter" },
    { label: "Facebook", href: "#", icon: "fab fa-facebook" },
    { label: "YouTube", href: "#", icon: "fab fa-youtube" }
  ];

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-b from-orange-500 via-white to-green-600 rounded border"></div>
              <span className="font-bold text-primary">SarkarConnect</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Empowering citizens with AI-driven access to government schemes and services.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid={`social-${social.label.toLowerCase()}`}
                  aria-label={social.label}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-testid={`quick-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Government Portals */}
          <div>
            <h3 className="font-semibold mb-4">Government Portals</h3>
            <ul className="space-y-2 text-sm">
              {governmentPortals.map((portal) => (
                <li key={portal.label}>
                  <a 
                    href={portal.href}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                    data-testid={`gov-portal-${portal.label.toLowerCase().replace(/[.\s]+/g, '-')}`}
                  >
                    {portal.label}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground flex items-center">
                <i className="fas fa-phone mr-2"></i>
                <span data-testid="support-phone">1800-XXX-XXXX</span>
              </li>
              <li className="text-muted-foreground flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                <span data-testid="support-email">support@sarkarconnect.gov.in</span>
              </li>
              <li className="text-muted-foreground flex items-center">
                <i className="fas fa-clock mr-2"></i>
                <span data-testid="support-hours">24/7 Helpline</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Government of India. All rights reserved. | 
            <a href="#" className="hover:text-primary ml-1" data-testid="link-accessibility">Accessibility</a> | 
            <a href="#" className="hover:text-primary ml-1" data-testid="link-sitemap">Sitemap</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
