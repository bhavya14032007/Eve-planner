import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Building2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { vendorApi, servicesApi } from '../services/api';
import { ServiceCategory } from '../types';
import { useAuth } from '../context/AuthContext';

export const RegisterVendorPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [categorySlug, setCategorySlug] = useState('venues-banquets');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [serviceArea, setServiceArea] = useState('Delhi NCR, Gurugram, Noida');
  const [startingPrice, setStartingPrice] = useState(25000);
  const [priceUnit, setPriceUnit] = useState('per event');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [portfolioImage, setPortfolioImage] = useState(
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    servicesApi.getCategories().then((res) => {
      if (res.success) {
        setCategories(res.data);
        if (res.data.length > 0) {
          setCategorySlug(res.data[0].slug);
        }
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await vendorApi.registerVendor({
        businessName,
        email,
        password,
        fullName,
        phone,
        categorySlug,
        description,
        address,
        city,
        serviceArea,
        startingPrice: Number(startingPrice),
        priceUnit,
        websiteUrl,
        portfolioImages: portfolioImage ? [portfolioImage] : [],
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/vendor-dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Vendor registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Join Eve Planner Partner Network
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          Register as an Event Vendor Partner
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Showcase your venue, catering, decor, or photography to celebration hosts with zero listing fees.
        </p>
      </div>

      {/* Info Notice about Admin Approval Flow */}
      <div className="p-4 rounded-xl bg-surface border border-border flex items-start gap-3 shadow-subtle">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-text-primary">Admin Verification Workflow</p>
          <p className="text-text-muted leading-relaxed">
            All vendor partners undergo administrative verification to ensure quality and prevent fraudulent pricing. After submission, your profile will be in <strong className="text-warning">PENDING_REVIEW</strong> status until verified by our moderation team.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger-subtle text-danger text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="p-8 rounded-2xl bg-success-subtle text-success text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 mx-auto" />
          <h2 className="text-lg font-bold">Vendor Registration Submitted!</h2>
          <p className="text-xs leading-relaxed max-w-md mx-auto">
            Your vendor profile has been recorded with status <strong>PENDING_REVIEW</strong>. You can view your dashboard while awaiting approval.
          </p>
          <Link
            to="/vendor-dashboard"
            className="inline-block px-5 py-2 rounded-xl bg-success text-white text-xs font-bold"
          >
            Go to Vendor Dashboard
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl bg-surface border border-border shadow-card space-y-6"
        >
          {/* Business & Contact Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
              1. Business Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Business / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Grand Heritage Banquet"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Primary Category *
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Contact Person Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Saxena"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
              2. Vendor Account Login
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vendor@company.com"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Location & Pricing */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2">
              3. Service Details & Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Base City *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                >
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Starting Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="500"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Price Unit *
                </label>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                >
                  <option value="per event">per event</option>
                  <option value="per plate">per plate</option>
                  <option value="per day">per day</option>
                  <option value="per hour">per hour</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Physical Address / Studio Location *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 15 DLF Phase 1, Golf Course Road"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Service Area Coverage
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Delhi NCR, Noida, Gurugram"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-text-secondary mb-1">
                Business Description & Specializations *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your capacity, culinary styles, past event achievements, and setup times..."
                className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:border-primary"
              ></textarea>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-text-secondary mb-1">
                Portfolio Showcase Image URL
              </label>
              <input
                type="url"
                value={portfolioImage}
                onChange={(e) => setPortfolioImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Already have a vendor account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </span>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-sm shadow-card transition-all transform active:scale-95"
            >
              {loading ? 'Submitting Application...' : 'Submit Vendor Registration →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
