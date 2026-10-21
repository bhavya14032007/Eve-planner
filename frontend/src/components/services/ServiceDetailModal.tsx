import React, { useState } from 'react';
import { X, MapPin, Users, CheckCircle, Check, Ban, Calendar, Star } from 'lucide-react';
import { ServiceListing } from '../../types';
import { StarRating } from '../common/StarRating';
import { bookingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ServiceDetailModalProps {
  service: ServiceListing;
  onClose: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({ service, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeImage, setActiveImage] = useState(
    service.images?.[0]?.imageUrl ||
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
  );

  const [bookingDate, setBookingDate] = useState('');
  const [guestCount, setGuestCount] = useState(service.maxGuests || 50);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!bookingDate) {
      setMessage('Please select a celebration date.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const res = await bookingsApi.createBooking({
        eventType: 'Custom Service Celebration',
        eventDate: bookingDate,
        startTime: '18:00',
        endTime: '22:00',
        location: service.location,
        city: service.city,
        guestCount: Number(guestCount),
        selectedListingIds: [service.id],
      });

      if (res.success) {
        setMessage('Booking request submitted! Redirecting to your dashboard...');
        setTimeout(() => {
          navigate('/my-bookings');
        }, 1500);
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-3xl bg-surface border border-border rounded-2xl shadow-modal overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {service.category.name}
            </span>
            <h2 id="service-modal-title" className="text-xl font-bold text-text-primary">
              {service.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Main Image & Gallery */}
          <div>
            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-surface-elevated mb-3 border border-border">
              <img
                src={activeImage}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
            {service.images && service.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {service.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img.imageUrl)}
                    className={`w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img.imageUrl ? 'border-primary' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vendor Card & Meta */}
          <div className="p-4 rounded-xl border border-border bg-surface-elevated flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm font-bold text-text-primary">
                  {service.vendor.businessName}
                </span>
                {service.vendor.isVerified && (
                  <span title="Verified Vendor">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </span>
                )}
              </div>
              <p className="text-xs text-text-secondary flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-text-muted" />
                  {service.location}, {service.city}
                </span>
                {service.maxGuests && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-text-muted" />
                    Capacity: Up to {service.maxGuests} Guests
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <StarRating rating={service.rating} reviewCount={service.reviewCount} size="md" />
              <span className="text-xs text-text-muted mt-1">Verified Client Reviews</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
              Overview
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">{service.description}</p>
          </div>

          {/* Inclusions and Exclusions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border bg-surface-elevated">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-success" />
                <span>What is Included</span>
              </h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                {service.inclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface-elevated">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-danger" />
                <span>Exclusions</span>
              </h4>
              <ul className="space-y-2 text-xs text-text-secondary">
                {service.exclusions.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Ban className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Direct Service Reservation Form */}
          <div className="p-5 rounded-xl border border-primary/20 bg-primary-subtle/40 space-y-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
              Reserve this Service
            </h4>
            {message && (
              <div className="p-2.5 rounded-lg bg-surface text-xs font-medium text-text-primary border border-border">
                {message}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Preferred Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Expected Guests
                </label>
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-text-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-surface-elevated flex items-center justify-between">
          <div>
            <span className="text-[11px] text-text-muted block">Starting From</span>
            <span className="text-xl font-extrabold text-text-primary">
              ₹{service.startingPrice.toLocaleString()}{' '}
              <span className="text-xs text-text-muted font-normal">{service.priceUnit}</span>
            </span>
          </div>
          <button
            onClick={handleBookNow}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold shadow-subtle transition-all transform active:scale-95"
          >
            {submitting ? 'Submitting...' : 'Request Reservation'}
          </button>
        </div>
      </div>
    </div>
  );
};
