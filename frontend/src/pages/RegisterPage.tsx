import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Phone, MapPin, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Delhi NCR');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await register({
        fullName,
        email,
        password,
        phone,
        city,
        address,
      });
      navigate('/my-bookings');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
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
            Create Customer Account
          </h1>
          <p className="text-xs text-text-muted">
            Start planning celebrations, saving custom packages, and tracking bookings.
          </p>
        </div>

        {/* Form */}
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
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Riya Sharma"
                className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="riya@example.com"
                className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-surface-elevated border border-border rounded-xl pl-9 pr-3 py-2 text-sm text-text-primary focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full bg-surface-elevated border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-text-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Primary City
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-text-muted absolute left-3 top-3" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-text-primary focus:border-primary"
                >
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold text-sm shadow-card transition-all transform active:scale-95"
          >
            {submitting ? 'Creating Account...' : 'Register Account'}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center text-xs text-text-muted">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
