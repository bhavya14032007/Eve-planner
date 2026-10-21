import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Heart, Shield, Award, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface border-t border-border mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
              <div className="w-8 h-8 rounded-md bg-primary-subtle text-primary flex items-center justify-center border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-text-primary text-xl font-extrabold tracking-tight">
                Eve<span className="text-primary">Planner</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
              The AI-powered celebration marketplace connecting memorable milestones with verified banquet halls, artisanal caterers, floral decorators, and photographers.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/Bhavya-Roy/Eve-Planner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface-elevated text-xs font-semibold text-text-primary hover:border-primary/50 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
              </a>
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <Shield className="w-3.5 h-3.5 text-success" />
                Verified Vendors Only
              </span>
            </div>
          </div>

          {/* Column 1: Marketplace */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
              Marketplace
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/explore-services?category=venues-banquets" className="hover:text-primary transition-colors">
                  Venues & Banquets
                </Link>
              </li>
              <li>
                <Link to="/explore-services?category=catering-menus" className="hover:text-primary transition-colors">
                  Catering & Buffets
                </Link>
              </li>
              <li>
                <Link to="/explore-services?category=decor-florals" className="hover:text-primary transition-colors">
                  Florals & Decor
                </Link>
              </li>
              <li>
                <Link to="/explore-services?category=photography-films" className="hover:text-primary transition-colors">
                  Photography & Films
                </Link>
              </li>
              <li>
                <Link to="/explore-services?category=entertainment-djs" className="hover:text-primary transition-colors">
                  DJs & Entertainment
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Celebrations */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
              Celebrations
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/packages?eventType=Birthday" className="hover:text-primary transition-colors">
                  Birthday Celebrations
                </Link>
              </li>
              <li>
                <Link to="/packages?eventType=Wedding" className="hover:text-primary transition-colors">
                  Weddings & Engagements
                </Link>
              </li>
              <li>
                <Link to="/packages?eventType=Anniversary" className="hover:text-primary transition-colors">
                  Anniversaries & Dinners
                </Link>
              </li>
              <li>
                <Link to="/packages?eventType=Baby%20Shower" className="hover:text-primary transition-colors">
                  Baby Showers
                </Link>
              </li>
              <li>
                <Link to="/ai-planner" className="hover:text-primary transition-colors font-medium text-primary">
                  AI Celebration Planner ✨
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Partner & Legal */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
              Partners & Support
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/register-with-us" className="hover:text-primary transition-colors">
                  Register as Vendor
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-primary transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <span className="text-text-muted cursor-not-allowed">
                  72-Hour Cancellation Policy
                </span>
              </li>
              <li>
                <span className="text-text-muted cursor-not-allowed">
                  Pricing Guarantee
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} Eve Planner Marketplace. Crafted for celebrations with full-stack excellence.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-accent" /> WCAG 2.2 AA Compliant
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-success" /> Server-side Pricing Protection
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
