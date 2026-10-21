import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Plus,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Users,
} from 'lucide-react';
import { vendorApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const VendorDashboardPage: React.FC = () => {
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Add Listing Form Modal
  const [showAddListing, setShowAddListing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState(30000);
  const [newDesc, setNewDesc] = useState('');
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
  );
  const [listingSubmitting, setListingSubmitting] = useState(false);

  const loadVendorData = async () => {
    setLoading(true);
    try {
      const [profileRes, analyticsRes, reqsRes] = await Promise.all([
        vendorApi.getProfile(),
        vendorApi.getAnalytics(),
        vendorApi.getRequests(),
      ]);

      if (profileRes.success) setVendorProfile(profileRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (reqsRes.success) setRequests(reqsRes.data);
    } catch (err) {
      console.error('Failed to load vendor portal data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const handleRespond = async (id: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await vendorApi.respondToRequest(id, status);
      if (res.success) {
        setActionMessage(`Booking request ${status.toLowerCase()} successfully.`);
        loadVendorData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update request.');
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setListingSubmitting(true);
    try {
      const res = await vendorApi.createListing({
        title: newTitle,
        startingPrice: Number(newPrice),
        description: newDesc,
        imageUrls: newImageUrl ? [newImageUrl] : [],
      });

      if (res.success) {
        setActionMessage('New service listing published successfully!');
        setShowAddListing(false);
        setNewTitle('');
        setNewDesc('');
        loadVendorData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create listing.');
    } finally {
      setListingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-sm text-text-muted">Loading your Vendor Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Vendor Profile Header */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-xl shadow-subtle">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                {vendorProfile?.businessName || 'Vendor Portal'}
              </h1>
              <StatusBadge status={vendorProfile?.status || 'PENDING_REVIEW'} />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {vendorProfile?.city} • {vendorProfile?.category?.name || 'Celebration Services'} • {vendorProfile?.phone}
            </p>
          </div>
        </div>

        {vendorProfile?.status === 'APPROVED' && (
          <button
            onClick={() => setShowAddListing(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Listing</span>
          </button>
        )}
      </div>

      {/* Review Status Warning if PENDING_REVIEW */}
      {vendorProfile?.status === 'PENDING_REVIEW' && (
        <div className="p-4 rounded-xl bg-warning-subtle text-warning border border-warning/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Vendor Profile Awaiting Admin Verification</p>
            <p className="leading-relaxed">
              Our moderation team reviews business documents to protect celebration hosts. Your listings will become visible on the public marketplace once approved by the admin.
            </p>
          </div>
        </div>
      )}

      {actionMessage && (
        <div className="p-4 rounded-xl bg-success-subtle text-success text-xs font-bold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-1">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" />
            <span>Total Requests</span>
          </span>
          <p className="text-2xl font-extrabold text-text-primary">
            {analytics?.totalRequests || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-1">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Acceptance Rate</span>
          </span>
          <p className="text-2xl font-extrabold text-text-primary">
            {analytics?.acceptanceRate || 100}%
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-1">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Active Listings</span>
          </span>
          <p className="text-2xl font-extrabold text-text-primary">
            {analytics?.activeListings || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-1">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-accent" />
            <span>Estimated Revenue</span>
          </span>
          <p className="text-2xl font-extrabold text-text-primary">
            ₹{(analytics?.estimatedRevenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Assigned Booking Requests Table / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">
            Incoming Celebration Requests ({requests.length})
          </h2>
          <button
            onClick={loadVendorData}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary">
                      {req.booking.bookingNumber}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary">
                    {req.listing.title} • {req.booking.eventType}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      {new Date(req.booking.eventDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-text-muted" />
                      {req.booking.startTime} - {req.booking.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-text-muted" />
                      {req.booking.guestCount} Guests
                    </span>
                    <span>Host: {req.booking.customer.fullName} ({req.booking.customer.phone})</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleRespond(req.id, 'ACCEPTED')}
                        className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-bold transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, 'DECLINED')}
                        className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-danger hover:bg-danger-subtle transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-text-muted uppercase">
                      Action Recorded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-surface border border-dashed border-border text-center text-xs text-text-muted">
            No celebration requests received yet. Requests from customer package bookings will appear here.
          </div>
        )}
      </div>

      {/* Add Listing Modal */}
      {showAddListing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-modal space-y-4">
            <h3 className="text-base font-bold text-text-primary">Create New Service Listing</h3>
            <form onSubmit={handleCreateListing} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-text-secondary mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. VIP Outdoor Terrace Banquet"
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-text-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">Starting Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-text-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detailed inclusions, capacity, and setup details..."
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-text-primary"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">Showcase Image URL</label>
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-text-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddListing(false)}
                  className="px-4 py-2 rounded-xl border border-border font-semibold text-text-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={listingSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold"
                >
                  {listingSubmitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
