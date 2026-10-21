import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary font-bold text-xl"
          >
            <div className="w-8 h-8 rounded-md bg-primary-subtle text-primary flex items-center justify-center border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-text-primary text-xl font-extrabold tracking-tight">
              Eve<span className="text-primary">Planner</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-text-muted">
            Manage your celebration reservations, vendor listings, or platform moderation.
          </p>
        </div>

        {/* Demo Fast-Login Helper Card */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-2 shadow-subtle">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
            ⚡ Quick-Fill Demo Credentials:
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('riya.sharma@example.com', 'Customer@123')}
              className="p-1.5 rounded-lg bg-surface-elevated border border-border hover:border-primary text-text-primary font-semibold text-center"
            >
              🎉 Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('royalpalace@eveplanner.com', 'Vendor@123')}
              className="p-1.5 rounded-lg bg-surface-elevated border border-border hover:border-primary text-text-primary font-semibold text-center"
            >
              🏪 Vendor
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@eveplanner.com', 'Admin@123')}
              className="p-1.5 rounded-lg bg-surface-elevated border border-border hover:border-primary text-text-primary font-semibold text-center"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4"
        >
          {error && (
            <div className="p-3 rounded-lg bg-danger-subtle text-danger text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-sm shadow-card transition-all transform active:scale-95"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-xs text-text-muted">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Create Customer Account
            </Link>{' '}
            or{' '}
            <Link to="/register-with-us" className="text-primary font-bold hover:underline">
              Register as Vendor
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
