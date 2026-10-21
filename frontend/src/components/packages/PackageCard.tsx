import React from 'react';
import { Users, Clock, Check, Sparkles, ArrowRight } from 'lucide-react';
import { EventPackage } from '../../types';

interface PackageCardProps {
  pkg: EventPackage;
  onCustomize: (pkg: EventPackage) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, onCustomize }) => {
  return (
    <article className="relative flex flex-col bg-surface rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* Popular Ribbon */}
      {pkg.isPopular && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold shadow-subtle">
          <Sparkles className="w-3 h-3 text-amber-200" />
          <span>Most Popular</span>
        </div>
      )}

      {/* Hero Image */}
      {pkg.imageUrl && (
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-elevated">
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-4">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/90 text-text-primary backdrop-blur-sm">
              {pkg.eventType}
            </span>
          </div>
        </div>
      )}

      {/* Package Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div>
          <h3 className="text-xl font-bold text-text-primary tracking-tight">{pkg.name}</h3>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">
            {pkg.description}
          </p>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 mt-4 py-2 border-y border-border text-xs text-text-secondary font-medium">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span>Up to {pkg.guestCapacity} Guests</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>{pkg.durationHours} Hours Duration</span>
            </span>
          </div>

          {/* Key Inclusions Preview */}
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Included Services
            </h4>
            <ul className="space-y-1.5 text-xs text-text-secondary">
              {pkg.inclusions.slice(0, 4).map((inc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{inc}</span>
                </li>
              ))}
              {pkg.inclusions.length > 4 && (
                <li className="text-[11px] text-primary font-medium pl-6">
                  + {pkg.inclusions.length - 4} more inclusions
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div>
            <span className="text-[11px] text-text-muted block font-medium">All-Inclusive Base</span>
            <span className="text-xl font-extrabold text-text-primary">
              ₹{pkg.basePrice.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => onCustomize(pkg)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-all transform active:scale-95"
          >
            <span>Customize & Book</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
