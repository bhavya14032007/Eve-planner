import React from 'react';
import { MapPin, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { ServiceListing } from '../../types';
import { StarRating } from '../common/StarRating';

interface ServiceCardProps {
  service: ServiceListing;
  onSelect: (service: ServiceListing) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
  const primaryImage =
    service.images?.find((img) => img.isPrimary)?.imageUrl ||
    service.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';

  return (
    <article className="group flex flex-col bg-surface rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
      {/* Media Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-elevated">
        <img
          src={primaryImage}
          alt={service.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-surface/90 backdrop-blur-md text-text-primary shadow-subtle border border-border/50">
            {service.category.name}
          </span>
          {service.isFeatured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-subtle">
              Featured
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-surface/90 backdrop-blur-md text-text-primary shadow-subtle border border-border/50">
            ₹{service.startingPrice.toLocaleString()} <span className="text-[10px] text-text-muted font-normal">{service.priceUnit}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Vendor Name & Rating */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-text-muted flex items-center gap-1">
              {service.vendor.businessName}
              {service.vendor.isVerified && (
                <span title="Verified Vendor">
                  <CheckCircle className="w-3.5 h-3.5 text-primary fill-primary-subtle" />
                </span>
              )}
            </span>
            <StarRating rating={service.rating} reviewCount={service.reviewCount} />
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Footer Meta & Action */}
        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 truncate max-w-[120px]">
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
              {service.city}
            </span>
            {service.maxGuests && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-text-muted shrink-0" />
                Up to {service.maxGuests}
              </span>
            )}
          </div>

          <button
            onClick={() => onSelect(service)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </article>
  );
};
