import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Minus, Calendar, MapPin, Users, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { EventPackage, PackageAddon } from '../../types';
import { bookingsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PackageCustomizerModalProps {
  pkg: EventPackage;
  onClose: () => void;
}

export const PackageCustomizerModal: React.FC<PackageCustomizerModalProps> = ({ pkg, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Addons state: map of addonId -> quantity
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  // Booking fields
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [city, setCity] = useState(user?.customerProfile?.city || 'Delhi NCR');
  const [location, setLocation] = useState(user?.customerProfile?.address || '');
  const [guestCount, setGuestCount] = useState(pkg.guestCapacity);
  const [specialRequirements, setSpecialRequirements] = useState('');

  // Price breakdown state
  const [basePrice, setBasePrice] = useState(pkg.basePrice);
  const [addonsTotal, setAddonsTotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState<'customize' | 'details' | 'confirm'>('customize');

  // Recalculate price dynamically whenever selected addons change
  useEffect(() => {
    let addonsSum = 0;
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      const addon = pkg.addons?.find((a) => a.id === addonId);
      if (addon && qty > 0) {
        addonsSum += addon.price * qty;
      }
    });

    const sub = pkg.basePrice + addonsSum;
    const computedTax = Math.round(sub * 0.05);

    setBasePrice(pkg.basePrice);
    setAddonsTotal(addonsSum);
    setTax(computedTax);
    setGrandTotal(sub + computedTax);
  }, [selectedAddons, pkg]);

  const handleAddonToggle = (addon: PackageAddon) => {
    setSelectedAddons((prev) => {
      const current = prev[addon.id] || 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[addon.id];
        return next;
      } else {
        return { ...prev, [addon.id]: 1 };
      }
    });
  };

  const handleQtyChange = (addonId: string, delta: number, maxQty: number) => {
    setSelectedAddons((prev) => {
      const current = prev[addonId] || 1;
      const nextVal = Math.min(Math.max(1, current + delta), maxQty);
      return { ...prev, [addonId]: nextVal };
    });
  };

  const handleSubmitBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!eventDate || !location || !city) {
      setErrorMessage('Please fill in event date, city, and venue address.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const addonsPayload = Object.entries(selectedAddons).map(([addonId, quantity]) => ({
        addonId,
        quantity,
      }));

      const res = await bookingsApi.createBooking({
        packageId: pkg.id,
        eventType: pkg.eventType,
        eventDate,
        startTime,
        endTime,
        location,
        city,
        guestCount: Number(guestCount),
        specialRequirements,
        selectedAddons: addonsPayload,
      });

      if (res.success) {
        setSuccessMessage('Celebration booking request submitted! Redirecting to your bookings...');
        setTimeout(() => {
          navigate('/my-bookings');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-modal overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-surface-elevated">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Customize Package
            </span>
            <h2 id="modal-title" className="text-xl font-bold text-text-primary">
              {pkg.name}
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

        {/* Step Indicator */}
        <div className="flex border-b border-border text-xs font-semibold bg-surface-elevated/40">
          <button
            onClick={() => setStep('customize')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              step === 'customize' ? 'border-primary text-primary font-bold' : 'border-transparent text-text-muted'
            }`}
          >
            1. Inclusions & Add-Ons
          </button>
          <button
            onClick={() => setStep('details')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              step === 'details' ? 'border-primary text-primary font-bold' : 'border-transparent text-text-muted'
            }`}
          >
            2. Event Details
          </button>
          <button
            onClick={() => setStep('confirm')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              step === 'confirm' ? 'border-primary text-primary font-bold' : 'border-transparent text-text-muted'
            }`}
          >
            3. Review & Request
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-danger-subtle text-danger text-xs font-semibold">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-lg bg-success-subtle text-success text-xs font-semibold">
              {successMessage}
            </div>
          )}

          {/* STEP 1: CUSTOMIZE ADDONS */}
          {step === 'customize' && (
            <div className="space-y-6">
              {/* Guaranteed Inclusions */}
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                  Included in this Package
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pkg.inclusions.map((inc, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-border bg-surface-elevated flex items-start gap-2 text-xs text-text-secondary"
                    >
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Add-Ons with Real-time Price Updates */}
              <div>
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Enhance with Custom Add-Ons</span>
                </h3>
                <p className="text-xs text-text-muted mb-3">
                  Select extra experiences. Your celebration total recalculates instantly below.
                </p>

                {pkg.addons && pkg.addons.length > 0 ? (
                  <div className="space-y-2">
                    {pkg.addons.map((addon) => {
                      const isSelected = !!selectedAddons[addon.id];
                      const currentQty = selectedAddons[addon.id] || 1;

                      return (
                        <div
                          key={addon.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-primary/50 bg-primary-subtle/40'
                              : 'border-border bg-surface hover:bg-surface-elevated'
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleAddonToggle(addon)}
                              className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                            />
                            <div>
                              <span className="text-sm font-bold text-text-primary block">
                                {addon.name}
                              </span>
                              <span className="text-xs text-primary font-semibold">
                                +₹{addon.price.toLocaleString()} each
                              </span>
                            </div>
                          </label>

                          {/* Quantity selector when selected */}
                          {isSelected && addon.maxQuantity > 1 && (
                            <div className="flex items-center gap-2 bg-surface px-2 py-1 rounded-lg border border-border">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(addon.id, -1, addon.maxQuantity)}
                                className="p-1 rounded text-text-muted hover:text-text-primary"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold px-1">{currentQty}</span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(addon.id, 1, addon.maxQuantity)}
                                className="p-1 rounded text-text-muted hover:text-text-primary"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">No add-ons available for this package.</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: EVENT DETAILS */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    Celebration Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      required
                      className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    Expected Guests *
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      required
                      className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    End Time
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="e.g. Delhi NCR, Mumbai"
                    className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                    Venue Address / Community Space *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-text-muted absolute left-3 top-3" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      placeholder="Full venue address"
                      className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
                  Special Notes or Dietary Preferences
                </label>
                <textarea
                  rows={2}
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="e.g. Jain food counters, surprise entry sequence, preferred colors..."
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:border-primary"
                ></textarea>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM & PRICE SUMMARY */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-surface-elevated space-y-3">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Reservation Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-text-muted block">Event Type:</span>
                    <span className="font-semibold text-text-primary">{pkg.eventType}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Date & Time:</span>
                    <span className="font-semibold text-text-primary">{eventDate} ({startTime} - {endTime})</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Location:</span>
                    <span className="font-semibold text-text-primary">{location}, {city}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Guests:</span>
                    <span className="font-semibold text-text-primary">{guestCount} People</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-success-subtle text-success text-xs font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Zero Advance Lock-in: Vendors confirm availability within 2 hours before payment.</span>
              </div>
            </div>
          )}

          {/* Transparent Price Recalculation Bar */}
          <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-2">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Base Package Price:</span>
              <span className="font-semibold">₹{basePrice.toLocaleString()}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between text-xs text-primary font-medium">
                <span>Selected Add-Ons Total:</span>
                <span>+ ₹{addonsTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-text-muted">
              <span>GST & Platform Security (5%):</span>
              <span>+ ₹{tax.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center text-sm font-bold text-text-primary">
              <span>Grand Total:</span>
              <span className="text-lg text-primary">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-elevated flex items-center justify-between">
          {step !== 'customize' ? (
            <button
              type="button"
              onClick={() => setStep(step === 'confirm' ? 'details' : 'customize')}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary"
            >
              Back
            </button>
          ) : (
            <span className="text-xs text-text-muted">Pricing calculated in real time</span>
          )}

          <div className="flex items-center gap-2">
            {step === 'customize' && (
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-colors"
              >
                Next: Event Details →
              </button>
            )}

            {step === 'details' && (
              <button
                type="button"
                onClick={() => {
                  if (!eventDate || !location || !city) {
                    setErrorMessage('Please fill in celebration date and location first.');
                    return;
                  }
                  setErrorMessage('');
                  setStep('confirm');
                }}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-colors"
              >
                Review Pricing Summary →
              </button>
            )}

            {step === 'confirm' && (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitBooking}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold shadow-subtle transition-all transform active:scale-95"
              >
                {submitting ? 'Submitting Request...' : 'Confirm & Submit Booking Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
