import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Users,
  Briefcase,
  Calendar,
  IndianRupee,
  RefreshCw,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [selectedVendorStatus, setSelectedVendorStatus] = useState('PENDING_REVIEW');

  // Verify modal state
  const [verifyingVendor, setVerifyingVendor] = useState<any | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, vendorsRes, bookingsRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getVendors(selectedVendorStatus !== 'ALL' ? selectedVendorStatus : undefined),
        adminApi.getAllBookings(),
        adminApi.getAuditLogs(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (vendorsRes.success) setVendors(vendorsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
      if (logsRes.success) setAuditLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user, selectedVendorStatus]);

  // Role Protection
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-surface border border-border text-center space-y-4 shadow-card">
        <ShieldCheck className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-text-primary">Admin Access Required</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          You must be signed in with an administrative account to view this portal. Public users cannot assign themselves the admin role.
        </p>
      </div>
    );
  }

  const handleVerifyVendor = async (status: 'APPROVED' | 'REJECTED') => {
    if (!verifyingVendor) return;
    setActionInProgress(true);
    try {
      const res = await adminApi.verifyVendor(verifyingVendor.id, status, verificationNotes);
      if (res.success) {
        setActionMessage(`Vendor ${verifyingVendor.businessName} was marked as ${status}.`);
        setVerifyingVendor(null);
        setVerificationNotes('');
        loadAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update vendor status.');
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-xs font-bold uppercase">
              Admin Portal
            </span>
            <span className="text-xs text-text-muted">Strict Role-Based Access</span>
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mt-1">
            Platform Moderation & Oversight
          </h1>
        </div>

        <button
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-surface-elevated transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh System Data</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-success-subtle text-success text-xs font-bold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-1">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary" />
            <span>Customers</span>
          </span>
          <p className="text-2xl font-extrabold text-text-primary">
            {stats?.totalCustomers || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-1">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-success" />
            <span>Approved Vendors</span>
          </span>
          <p className="text-2xl font-extrabold text-text-primary">
            {stats?.totalVendors || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-1">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span>Pending Reviews</span>
          </span>
          <p className="text-2xl font-extrabold text-warning">
            {stats?.pendingVendors || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-1">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Total Bookings</span>
          </span>
          <p className="text-2xl font-extrabold text-text-primary">
            {stats?.totalBookings || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-subtle space-y-1 col-span-2 sm:col-span-1">
          <span className="text-xs text-text-muted flex items-center gap-1.5">
            <IndianRupee className="w-4 h-4 text-accent" />
            <span>Platform Volume</span>
          </span>
          <p className="text-2xl font-extrabold text-text-primary">
            ₹{(stats?.totalRevenue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Vendor Verification Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Vendor Moderation Queue ({vendors.length})
            </h2>
            <p className="text-xs text-text-muted">
              Review and approve vendor applications before listings go live.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedVendorStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  selectedVendorStatus === st
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:bg-surface-elevated'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {vendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendors.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{v.category?.name}</span>
                    <StatusBadge status={v.status} />
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{v.businessName}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {v.description}
                  </p>
                  <div className="text-xs text-text-muted space-y-0.5 pt-1">
                    <p>Contact: {v.user?.fullName} ({v.phone})</p>
                    <p>Email: {v.user?.email}</p>
                    <p>Location: {v.address}, {v.city}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    Joined: {new Date(v.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => setVerifyingVendor(v)}
                    className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-subtle"
                  >
                    Review & Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-surface border border-dashed border-border text-center text-xs text-text-muted">
            No vendors found in this queue.
          </div>
        )}
      </div>

      {/* Recent Admin Audit Trail */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary">
          Security & Admin Audit Logs (Latest 10)
        </h2>
        <div className="rounded-2xl bg-surface border border-border overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-secondary">
              <thead className="bg-surface-elevated border-b border-border text-text-primary font-bold uppercase">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-surface-elevated/40">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {log.admin?.fullName || 'System Admin'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-surface-elevated font-mono font-bold text-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">{log.targetEntity}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{log.details || '—'}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-text-muted">
                      No administrative actions logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Verify Vendor Modal */}
      {verifyingVendor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-modal space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text-primary">
                Verify Vendor: {verifyingVendor.businessName}
              </h3>
              <button
                onClick={() => setVerifyingVendor(null)}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 text-text-secondary">
              <p><strong>Owner:</strong> {verifyingVendor.user?.fullName} ({verifyingVendor.phone})</p>
              <p><strong>Address:</strong> {verifyingVendor.address}, {verifyingVendor.city}</p>
              <p><strong>Description:</strong> {verifyingVendor.description}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1">
                Admin Audit Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="e.g. Verified business registration documents and phone contact..."
                className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 text-xs text-text-primary focus:border-primary"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setVerifyingVendor(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionInProgress}
                onClick={() => handleVerifyVendor('REJECTED')}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-danger hover:bg-danger-subtle"
              >
                Reject Vendor
              </button>
              <button
                type="button"
                disabled={actionInProgress}
                onClick={() => handleVerifyVendor('APPROVED')}
                className="px-5 py-2 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-bold shadow-subtle"
              >
                {actionInProgress ? 'Processing...' : 'Approve & Publish Listings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
