import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Ban,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingsApi } from '../services/api';
import { EventBooking } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [selectedBookingForPay, setSelectedBookingForPay] = useState<EventBooking | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.getMyBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load user bookings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this celebration request?')) return;
    try {
      const res = await bookingsApi.cancelBooking(id, 'Cancelled by user from dashboard');
      if (res.success) {
        setActionMessage('Booking request cancelled.');
        loadBookings();
      }
    } catch (err: any) {
      alert(err.message || 'Could not cancel booking.');
    }
  };

  const handlePayDemo = async (booking: EventBooking) => {
    try {
      const res = await bookingsApi.simulatePayment(booking.id, 'UPI');
      if (res.success) {
        setActionMessage(`Payment verified! Reservation ${booking.bookingNumber} is now confirmed.`);
        setSelectedBookingForPay(null);
        loadBookings();
      }
    } catch (err: any) {
      alert(err.message || 'Payment simulation failed.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-surface border border-border text-center space-y-4 shadow-card">
        <div className="w-12 h-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Sign in to View Your Bookings</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          Please sign in to track your celebration requests, review vendor responses, and complete secure payments.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-colors"
        >
          <span>Sign In to Your Account</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-extrabold text-xl shadow-subtle">
            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {user?.fullName || 'Celebration Host'}
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              {user?.email} • {user?.customerProfile?.city || 'Delhi NCR'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/ai-planner"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Plan Another Celebration</span>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-success-subtle text-success text-xs font-bold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Bookings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">
            My Celebration Bookings & Requests ({bookings.length})
          </h2>
          <button
            onClick={loadBookings}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3 bg-surface rounded-2xl border border-border">
            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
            <p className="text-sm text-text-muted">Loading your celebration reservations...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">
                        {booking.bookingNumber}
                      </span>
                      <StatusBadge status={booking.status} />
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          booking.paymentStatus === 'PAID'
                            ? 'bg-success-subtle text-success'
                            : 'bg-warning-subtle text-warning'
                        }`}
                      >
                        Payment: {booking.paymentStatus}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-text-primary">
                      {booking.package?.name || `${booking.eventType} Celebration`}
                    </h3>
                  </div>

                  {/* Price & Action */}
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-text-muted block">Verified Total</span>
                    <span className="text-xl font-extrabold text-text-primary">
                      ₹{booking.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-text-muted block">Celebration Date:</span>
                    <span className="font-semibold text-text-primary flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {new Date(booking.eventDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block">Time Slot:</span>
                    <span className="font-semibold text-text-primary flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block">Venue & City:</span>
                    <span className="font-semibold text-text-primary flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      {booking.city}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block">Guest Count:</span>
                    <span className="font-semibold text-text-primary flex items-center gap-1 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {booking.guestCount} Guests
                    </span>
                  </div>
                </div>

                {/* Multi-Vendor Service Requests Status */}
                {booking.services && booking.services.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-surface-elevated border border-border/80 space-y-2">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                      Assigned Vendor Requests ({booking.services.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {booking.services.map((srv, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-surface border border-border flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-text-primary block">
                              {srv.vendor.businessName}
                            </span>
                            <span className="text-[11px] text-text-muted">{srv.listing.title}</span>
                          </div>
                          <span className="text-xs font-bold text-primary">
                            ₹{srv.listing.startingPrice.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-text-muted flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-success" />
                    <span>Free cancellation up to 72 hours prior to celebration date.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold text-danger hover:bg-danger-subtle transition-colors flex items-center gap-1"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel Request</span>
                      </button>
                    )}

                    {booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handlePayDemo(booking)}
                        className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-colors flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Securely (Demo Flow)</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl bg-surface border border-dashed border-border space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">No Active Bookings Yet</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                Explore our curated celebration packages or use the AI celebration planner to configure your event.
              </p>
            </div>
            <Link
              to="/packages"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle transition-colors"
            >
              <span>Explore Pre-Built Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
