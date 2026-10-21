import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Building2,
  Utensils,
  Camera,
  Music,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { servicesApi, packagesApi } from '../services/api';
import { ServiceCategory, ServiceListing, EventPackage } from '../types';
import { ServiceCard } from '../components/services/ServiceCard';
import { PackageCard } from '../components/packages/PackageCard';
import { PackageCustomizerModal } from '../components/packages/PackageCustomizerModal';
import { ServiceDetailModal } from '../components/services/ServiceDetailModal';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredServices, setFeaturedServices] = useState<ServiceListing[]>([]);
  const [popularPackages, setPopularPackages] = useState<EventPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catsRes, featRes, pkgsRes] = await Promise.all([
          servicesApi.getCategories(),
          servicesApi.getFeatured(),
          packagesApi.getPackages(),
        ]);

        if (catsRes.success) setCategories(catsRes.data);
        if (featRes.success) setFeaturedServices(featRes.data);
        if (pkgsRes.success) {
          setPopularPackages(pkgsRes.data.filter((p: EventPackage) => p.isPopular).slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-primary-subtle/50 via-background to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-primary/20 text-xs font-semibold text-primary shadow-subtle">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Event & Celebration Marketplace</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
                Plan Unforgettable Celebrations with{' '}
                <span className="text-primary underline decoration-primary/30 decoration-wavy">
                  Verified Local Vendors
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect with top-rated banquet halls, catering chefs, photographers, and decorators. Configure transparent pre-built packages or design with our intelligent Gemini AI celebration architect.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/ai-planner"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-card hover:shadow-card-hover transition-all transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Plan My Celebration with AI</span>
                </Link>
                <Link
                  to="/packages"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface hover:bg-surface-elevated text-text-primary text-sm font-bold border border-border transition-colors"
                >
                  <span>Explore Packages</span>
                  <ArrowRight className="w-4 h-4 text-text-muted" />
                </Link>
              </div>

              {/* Proof Points */}
              <div className="pt-6 border-t border-border/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  100% Verified Local Vendors
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  Server-side Price Guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-success" />
                  72-Hour Free Cancellation
                </span>
              </div>
            </div>

            {/* Right Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-card border-4 border-surface bg-surface-elevated">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80"
                    alt="Elegant celebration hall"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-surface/90 backdrop-blur-md border border-border/60 shadow-modal">
                    <div className="flex items-center justify-between text-xs font-bold text-text-primary">
                      <span>Royal Heritage Wedding Package</span>
                      <span className="text-primary font-extrabold">₹2,25,000</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span>Up to 250 Guests • Banquets • Decor • 4K Film</span>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Card */}
                <div className="absolute -top-6 -left-6 hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-surface border border-border shadow-card backdrop-blur-md animate-bounce duration-1000 motion-reduce:animate-none">
                  <div className="w-9 h-9 rounded-xl bg-success-subtle text-success flex items-center justify-center font-bold text-xs">
                    4.9★
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-text-primary">500+ Celebrations</p>
                    <p className="text-text-muted">Delhi NCR, Mumbai, BLR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EVENT CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Curated Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Everything Needed for Your Perfect Event
          </h2>
          <p className="text-sm text-text-secondary max-w-xl mx-auto">
            From pillarless ballroom banquets to Michelin-trained catering and candid drone photography.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/explore-services?category=${cat.slug}`}
              className="group p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 shadow-subtle hover:shadow-card transition-all text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-subtle text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                {cat.icon === 'Building2' && <Building2 className="w-6 h-6" />}
                {cat.icon === 'Utensils' && <Utensils className="w-6 h-6" />}
                {cat.icon === 'Camera' && <Camera className="w-6 h-6" />}
                {cat.icon === 'Music' && <Music className="w-6 h-6" />}
                {!['Building2', 'Utensils', 'Camera', 'Music'].includes(cat.icon) && (
                  <Sparkles className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors leading-tight">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. POPULAR PRE-BUILT PACKAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Pre-Configured Combos
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Popular Celebration Packages
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Save hours of vendor coordination with tested, transparent all-inclusive bundles.
            </p>
          </div>
          <Link
            to="/packages"
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover self-start sm:self-auto"
          >
            <span>View All Packages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onCustomize={(selected) => setSelectedPackage(selected)}
            />
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="bg-surface-elevated border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Simple & Transparent
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              How Eve Planner Works
            </h2>
            <p className="text-sm text-text-secondary max-w-xl mx-auto">
              Stress-free celebration booking backed by verified service coordination and zero hidden charges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-extrabold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="text-base font-bold text-text-primary">Discover & Choose</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Browse pre-built packages or hand-pick venues, caterers, and photographers in your city.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-extrabold text-xs flex items-center justify-center">
                2
              </span>
              <h3 className="text-base font-bold text-text-primary">AI Customization</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Add customized decor, live music, or extra courses with immediate live price recalculation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-extrabold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-bold text-text-primary">Vendor Confirmation</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Participating vendors confirm calendar availability within 2-4 hours before any payment is made.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border shadow-subtle space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-primary text-white font-extrabold text-xs flex items-center justify-center">
                4
              </span>
              <h3 className="text-base font-bold text-text-primary">Celebrate Flawlessly</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Enjoy your special milestone while our verified vendor partners handle logistics seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED SERVICES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Handpicked Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Featured Verified Services
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Top-rated celebration professionals vetted for stellar track records and transparent pricing.
            </p>
          </div>
          <Link
            to="/explore-services"
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover self-start sm:self-auto"
          >
            <span>Explore All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.slice(0, 3).map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={(selected) => setSelectedService(selected)}
            />
          ))}
        </div>
      </section>

      {/* 6. VENDOR ONBOARDING CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-primary to-accent p-8 sm:p-12 text-white shadow-card flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wide uppercase">
              Partner With Eve Planner
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Are you an Event Venue, Caterer, Decorator or Photographer?
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Join our curated celebration marketplace. Reach high-intent event hosts, manage bookings in your private vendor dashboard, and grow your celebration brand.
            </p>
          </div>
          <Link
            to="/register-with-us"
            className="px-8 py-4 rounded-xl bg-surface text-text-primary font-bold text-sm shadow-modal hover:bg-surface-elevated transition-colors shrink-0"
          >
            Register as a Vendor Today →
          </Link>
        </div>
      </section>

      {/* Modals */}
      {selectedPackage && (
        <PackageCustomizerModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}

      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};
