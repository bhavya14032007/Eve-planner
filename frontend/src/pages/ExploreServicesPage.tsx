import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { servicesApi } from '../services/api';
import { ServiceListing, ServiceCategory } from '../types';
import { ServiceCard } from '../components/services/ServiceCard';
import { ServiceDetailModal } from '../components/services/ServiceDetailModal';

export const ExploreServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [services, setServices] = useState<ServiceListing[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceListing | null>(null);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [city, setCity] = useState(searchParams.get('city') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minGuests, setMinGuests] = useState(searchParams.get('minGuests') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch categories once
  useEffect(() => {
    servicesApi.getCategories().then((res) => {
      if (res.success) setCategories(res.data);
    });
  }, []);

  // Sync state with URL params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await servicesApi.getServices({
        search,
        category: category !== 'All' ? category : undefined,
        city: city !== 'All' ? city : undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        minGuests: minGuests || undefined,
        sortBy,
        page,
        limit: 9,
      });

      if (res.success) {
        setServices(res.data);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalCount(res.pagination.totalCount || 0);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [category, city, sortBy, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadServices();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setCity('All');
    setMinPrice('');
    setMaxPrice('');
    setMinGuests('');
    setSortBy('rating');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Marketplace Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          Explore Celebration Services & Venues
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          Discover verified venues, artisanal caterers, photographers, and decorators in Delhi NCR, Mumbai, and Bangalore.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4">
        {/* Search input + Action */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by venue name, cuisine, photography style, or city..."
              className="w-full bg-surface-elevated border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary placeholder:text-text-muted"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-subtle transition-colors shrink-0"
          >
            Search Services
          </button>
        </form>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-border/60 text-xs">
          {/* Category Dropdown */}
          <div>
            <label className="block font-bold text-text-secondary mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-elevated border border-border rounded-lg px-2.5 py-2 text-text-primary focus:border-primary"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block font-bold text-text-secondary mb-1">City</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-elevated border border-border rounded-lg px-2.5 py-2 text-text-primary focus:border-primary"
            >
              <option value="All">All Cities</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>

          {/* Guest Capacity */}
          <div>
            <label className="block font-bold text-text-secondary mb-1">Min Guests</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={minGuests}
              onChange={(e) => setMinGuests(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg px-2.5 py-2 text-text-primary focus:border-primary"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block font-bold text-text-secondary mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-lg px-2.5 py-2 text-text-primary focus:border-primary"
            >
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end col-span-2 sm:col-span-1">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-border rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>
          Showing <strong className="text-text-primary">{services.length}</strong> of{' '}
          <strong className="text-text-primary">{totalCount}</strong> verified services
        </span>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-text-muted">Loading verified celebration services...</p>
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={(selected) => setSelectedService(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-surface border border-border space-y-4">
          <p className="text-base font-bold text-text-primary">No services found matching your criteria.</p>
          <p className="text-xs text-text-muted">
            Try adjusting your search keywords, budget, or city filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg border border-border text-xs font-semibold disabled:opacity-50 hover:bg-surface-elevated"
          >
            Previous
          </button>
          <span className="text-xs text-text-muted font-medium px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg border border-border text-xs font-semibold disabled:opacity-50 hover:bg-surface-elevated"
          >
            Next
          </button>
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
};
