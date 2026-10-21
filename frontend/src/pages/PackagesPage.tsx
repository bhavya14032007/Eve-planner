import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { packagesApi } from '../services/api';
import { EventPackage } from '../types';
import { PackageCard } from '../components/packages/PackageCard';
import { PackageCustomizerModal } from '../components/packages/PackageCustomizerModal';

export const PackagesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentEventType = searchParams.get('eventType') || 'All';

  const [packages, setPackages] = useState<EventPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<EventPackage | null>(null);

  const eventTypes = [
    'All',
    'Birthday',
    'Anniversary',
    'Proposal',
    'Baby Shower',
    'Wedding',
    'Corporate',
  ];

  const loadPackages = async (type: string) => {
    setLoading(true);
    try {
      const res = await packagesApi.getPackages(type !== 'All' ? type : undefined);
      if (res.success) {
        setPackages(res.data);
      }
    } catch (err) {
      console.error('Failed to load packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages(currentEventType);
  }, [currentEventType]);

  const handleTypeSelect = (type: string) => {
    if (type === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ eventType: type });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-subtle text-primary text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Configurable All-Inclusive Bundles</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          Curated Pre-Built Celebration Packages
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          Skip weeks of vendor vetting. Every package comes with verified banquet halls, decor, and catering with real-time add-on customization.
        </p>
      </div>

      {/* Celebration Type Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {eventTypes.map((type) => {
          const active = currentEventType === type;
          return (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                active
                  ? 'bg-primary text-white shadow-subtle'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              {type === 'All' ? 'All Celebrations' : `${type}`}
            </button>
          );
        })}
      </div>

      {/* Packages Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-text-muted">Loading verified celebration packages...</p>
        </div>
      ) : packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onCustomize={(selected) => setSelectedPackage(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-3">
          <p className="text-base font-bold text-text-primary">No packages found for this celebration type.</p>
          <button
            onClick={() => handleTypeSelect('All')}
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold"
          >
            Show All Packages
          </button>
        </div>
      )}

      {/* Quality Guarantees Banner */}
      <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <span>
            <strong className="text-text-primary">Immediate Recalculation:</strong> Add or remove add-ons with zero hidden fees.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <span>
            <strong className="text-text-primary">Direct Vendor Coordination:</strong> Eve Planner links separate service requests automatically.
          </span>
        </div>
      </div>

      {/* Package Customizer Modal */}
      {selectedPackage && (
        <PackageCustomizerModal
          pkg={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </div>
  );
};
