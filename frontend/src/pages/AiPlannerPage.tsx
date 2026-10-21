import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  MapPin,
  IndianRupee,
  Lightbulb,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { aiApi, packagesApi } from '../services/api';
import { AiRecommendationResult, EventPackage } from '../types';
import { PackageCustomizerModal } from '../components/packages/PackageCustomizerModal';

export const AiPlannerPage: React.FC = () => {
  // Input form state
  const [eventType, setEventType] = useState('Birthday');
  const [city, setCity] = useState('Delhi NCR');
  const [guestCount, setGuestCount] = useState(35);
  const [budget, setBudget] = useState(50000);
  const [themeOrStyle, setThemeOrStyle] = useState('Modern Minimalist & Warm Floral');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Venues & Banquets',
    'Catering',
    'Florals & Decor',
  ]);

  // Loading & Results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recommendationResult, setRecommendationResult] = useState<AiRecommendationResult | null>(null);

  // Selected package for customizer modal
  const [activePackageToCustomize, setActivePackageToCustomize] = useState<EventPackage | null>(null);

  const availableServicesList = [
    'Venues & Banquets',
    'Catering',
    'Florals & Decor',
    'Photography & Films',
    'DJs & Sound',
    'Cakes & Desserts',
  ];

  const handleServiceToggle = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await aiApi.getRecommendations({
        eventType,
        guestCount: Number(guestCount),
        budget: Number(budget),
        city,
        themeOrStyle,
        requiredServices: selectedServices,
        specialRequirements,
      });

      if (res.success && res.data) {
        setRecommendationResult(res.data);
      } else {
        throw new Error('Failed to generate celebration plan.');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI recommendation engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustomize = async (packageId: string) => {
    try {
      const res = await packagesApi.getPackageDetail(packageId);
      if (res.success && res.data) {
        setActivePackageToCustomize(res.data);
      }
    } catch (err) {
      console.error('Failed to load package for customization', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-subtle text-primary text-xs font-semibold shadow-subtle border border-primary/20">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Intelligent Hybrid Celebration Architect</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
          Plan Your Event with Gemini AI
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          Tell us your vision, guest count, and budget. Our hybrid system matches verified database packages, calculates suitability scores, and explains why each option fits your celebration.
        </p>
      </div>

      {/* Main Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              <span>Celebration Parameters</span>
            </h2>
            <span className="text-[11px] text-text-muted">100% Verified DB Grounding</span>
          </div>

          <form onSubmit={handleGeneratePlan} className="space-y-4 text-xs">
            {/* Event Type */}
            <div>
              <label className="block font-bold text-text-secondary uppercase tracking-wider mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-text-primary focus:border-primary text-sm font-medium"
              >
                <option value="Birthday">Birthday Celebration</option>
                <option value="Anniversary">Anniversary & Dinner</option>
                <option value="Proposal">Proposal & Engagement</option>
                <option value="Baby Shower">Baby Shower Celebration</option>
                <option value="Wedding">Wedding Celebration</option>
                <option value="Corporate">Corporate Gala & Award Night</option>
              </select>
            </div>

            {/* City & Guests */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Location City
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-surface-elevated border border-border rounded-xl pl-8 pr-3 py-2 text-text-primary focus:border-primary text-sm font-medium"
                  >
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Guest Count
                </label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-surface-elevated border border-border rounded-xl pl-8 pr-3 py-2 text-text-primary focus:border-primary text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-text-secondary uppercase tracking-wider">
                  Target Budget
                </label>
                <span className="font-extrabold text-primary text-sm">
                  ₹{Number(budget).toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="20000"
                max="300000"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>₹20,000</span>
                <span>₹1,50,000</span>
                <span>₹3,00,000+</span>
              </div>
            </div>

            {/* Style / Theme */}
            <div>
              <label className="block font-bold text-text-secondary uppercase tracking-wider mb-1">
                Preferred Theme / Style
              </label>
              <input
                type="text"
                value={themeOrStyle}
                onChange={(e) => setThemeOrStyle(e.target.value)}
                placeholder="e.g. Boho chic, Royal heritage, Fairy lights..."
                className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-text-primary focus:border-primary text-sm font-medium"
              />
            </div>

            {/* Required Services Checkboxes */}
            <div>
              <label className="block font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Key Services Needed
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {availableServicesList.map((srv) => {
                  const isChecked = selectedServices.includes(srv);
                  return (
                    <button
                      type="button"
                      key={srv}
                      onClick={() => handleServiceToggle(srv)}
                      className={`px-2.5 py-1.5 rounded-lg border text-left transition-colors flex items-center justify-between text-xs ${
                        isChecked
                          ? 'border-primary bg-primary-subtle font-bold text-primary'
                          : 'border-border bg-surface-elevated text-text-secondary'
                      }`}
                    >
                      <span className="truncate">{srv}</span>
                      {isChecked && <Check className="w-3 h-3 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Notes */}
            <div>
              <label className="block font-bold text-text-secondary uppercase tracking-wider mb-1">
                Special Requirements (Optional)
              </label>
              <textarea
                rows={2}
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g. Vegetarian only, toddler play area, acoustic music only..."
                className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-text-primary focus:border-primary text-xs"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-sm shadow-card transition-all transform active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consulting Gemini AI & Matching Packages...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Generate AI Celebration Recommendations</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-danger-subtle text-danger text-xs font-semibold">
              {error}
            </div>
          )}

          {recommendationResult ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header with Fallback indicator if applicable */}
              <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between shadow-subtle">
                <div>
                  <h3 className="text-sm font-extrabold text-text-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Top 3 Matched Celebration Proposals</span>
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Ranked by hybrid suitability score, budget fit, and capacity.
                  </p>
                </div>
                {recommendationResult.isFallback ? (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-warning-subtle text-warning font-semibold border border-warning/30">
                    Database Heuristic Mode
                  </span>
                ) : (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-success-subtle text-success font-semibold border border-success/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Gemini 1.5 Grounded
                  </span>
                )}
              </div>

              {/* Recommendations Cards */}
              <div className="space-y-4">
                {recommendationResult.topRecommendations.map((rec, index) => (
                  <article
                    key={rec.packageId}
                    className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/40 shadow-card transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="text-base font-bold text-text-primary">{rec.packageName}</h4>
                          <span className="text-xs text-text-muted">
                            Accommodates up to {rec.guestCapacity} Guests
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs text-text-muted block">Verified Price</span>
                          <span className="text-base font-extrabold text-primary">
                            ₹{rec.actualPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-primary-subtle text-primary text-xs font-bold border border-primary/20">
                          {rec.matchScore}% Match
                        </div>
                      </div>
                    </div>

                    {/* AI Match Explanation */}
                    <div className="p-3.5 rounded-xl bg-surface-elevated border border-border/80 space-y-1.5">
                      <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-accent" />
                        <span>Why Eve AI Selected This:</span>
                      </span>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {rec.matchExplanation}
                      </p>
                      <p className="text-[11px] text-text-muted font-medium pt-1">
                        💰 <strong>Budget Analysis:</strong> {rec.whyItFitsBudget}
                      </p>
                    </div>

                    {/* Customization Suggestions */}
                    {rec.customizationSuggestions && rec.customizationSuggestions.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                          Tailoring Suggestions
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-text-muted">
                          {rec.customizationSuggestions.map((tip, tIdx) => (
                            <li key={tIdx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              <span className="truncate">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleOpenCustomize(rec.packageId)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-all transform active:scale-95"
                      >
                        <span>Customize & Reserve This Proposal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Planning Timeline & Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timeline */}
                <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Suggested Planning Timeline</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {recommendationResult.suggestedTimeline.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Celebration Tips */}
                <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-3">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Celebration Architect Tips</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {recommendationResult.celebrationTips.map((tip, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State before submission */
            <div className="p-12 text-center rounded-2xl bg-surface border border-dashed border-border space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-primary">Ready to Design Your Event</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                  Adjust the parameters on the left and click Generate. Our algorithm matches verified packages and Gemini AI produces tailored planning recommendations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Package Customizer Modal Integration */}
      {activePackageToCustomize && (
        <PackageCustomizerModal
          pkg={activePackageToCustomize}
          onClose={() => setActivePackageToCustomize(null)}
        />
      )}
    </div>
  );
};
