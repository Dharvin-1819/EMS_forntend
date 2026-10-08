import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import EventCard from '../../components/ui/EventCard';
import { CATEGORIES } from '../../data/mockData';
import { getCategoryPalette } from '../../utils/categoryColors';

const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Date: Earliest First' },
  { value: 'date-desc', label: 'Date: Latest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const LOCATIONS = ['All', 'Chennai', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Mysore'];

export default function EventListPage() {
  const { events } = useSelector(s => s.events);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState('All');
  const [sort, setSort] = useState('date-asc');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [showPast, setShowPast] = useState(false);

  const filtered = events
    .filter(e => {
      if (!showPast && e.isPast) return false;
      if (query && !e.title.toLowerCase().includes(query.toLowerCase()) &&
          !e.description.toLowerCase().includes(query.toLowerCase()) &&
          !e.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))) return false;
      if (category && e.category !== category) return false;
      if (location && location !== 'All' && !e.location.includes(location)) return false;
      if (e.price < priceRange[0] || e.price > priceRange[1]) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setLocation('All');
    setSort('date-asc');
    setPriceRange([0, 50000]);
    setShowPast(false);
  };

  const hasFilters = query || category || location !== 'All' || sort !== 'date-asc' || showPast;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: 'var(--navbar-h)' }}>
        <div className="container" style={{ padding: 'var(--s-xl) var(--s-md)' }}>

          {/* Header */}
          <div className="mb-lg">
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>Events</h1>
            <p style={{ color: '#ffffff', opacity: 0.85 }}>{filtered.length} experiences found</p>
          </div>

          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#ffffff',
            border: '1px solid #AD974F',
            borderRadius: 'var(--radius)',
            padding: '8px 16px',
            marginBottom: 'var(--s-lg)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#000000' }}>SEARCH:</span>
            <input
              id="event-search-input"
              type="text"
              placeholder="Search by title, category, or tags..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ background: 'none', border: 'none', color: '#000000', flex: 1, outline: 'none', fontWeight: 600 }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ color: '#000000', fontSize: '0.8rem', fontWeight: 700 }}>
                Clear
              </button>
            )}
          </div>

          {/* Filters */}
          <div style={{ marginBottom: 'var(--s-md)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ffffff' }}>CATEGORY:</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['', ...CATEGORIES].map(cat => {
                const palette = cat ? getCategoryPalette(cat) : null;
                const isSelected = category === cat;
                return (
                  <button
                    key={cat || 'all'}
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: '6px 14px', borderRadius: 'var(--radius)',
                      fontSize: '0.85rem', fontWeight: 800,
                      background: isSelected ? (palette ? palette.gradient : '#231F20') : '#ffffff',
                      color: isSelected ? '#ffffff' : '#000000',
                      border: `1px solid ${isSelected ? (palette ? palette.primary : '#AD974F') : '#AD974F'}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease'
                    }}
                    id={`filter-cat-${cat || 'all'}`}
                  >
                    {palette ? cat : 'All Categories'}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--s-md)', marginBottom: 'var(--s-xl)', flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-select" style={{ width: 'auto', background: '#ffffff', color: '#000000', borderColor: '#AD974F', fontWeight: 700 }} value={location} onChange={e => setLocation(e.target.value)} id="filter-location">
              {LOCATIONS.map(l => <option key={l} value={l} style={{ background: '#ffffff', color: '#000000' }}>{l === 'All' ? 'All Locations' : l}</option>)}
            </select>

            <select className="form-select" style={{ width: 'auto', background: '#ffffff', color: '#000000', borderColor: '#AD974F', fontWeight: 700 }} value={sort} onChange={e => setSort(e.target.value)} id="filter-sort">
              {SORT_OPTIONS.map(s => <option key={s.value} value={s.value} style={{ background: '#ffffff', color: '#000000' }}>{s.label}</option>)}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', cursor: 'pointer', fontWeight: 700, color: '#ffffff' }}>
              <input type="checkbox" id="filter-past-events" checked={showPast} onChange={e => setShowPast(e.target.checked)} />
              Show Completed
            </label>

            {hasFilters && (
              <button className="btn btn-sm btn-danger" onClick={clearFilters} id="clear-filters-btn">
                Clear All Filter
              </button>
            )}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>No Results</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Try adjusting your filters or search terms</div>
              <button className="btn btn-secondary" onClick={clearFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="grid-events">
              {filtered.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
