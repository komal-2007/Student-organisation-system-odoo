import { useMemo, useState } from 'react';
import { ArrowRight, CalendarRange, Filter, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PublicDashboard.css';

import PublicNavbar from './components/PublicNavbar';
import PublicHero from './components/PublicHero';
import BrowserPreview from './components/BrowserPreview';
import FeaturedEvents from './components/FeaturedEvents';
import MerchandisePreview from './components/MerchandisePreview';
import JoinClubCTA from './components/JoinClubCTA';
import PublicFooter from './components/PublicFooter';
import EventCard from './components/EventCard';
import ProductCard from './components/ProductCard';
import SignInPage from './components/SignInPage';
import { merchandise, publicEvents } from './data/publicMockData';

function PublicDashboard({ variant = 'home' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStock, setSelectedStock] = useState('All availability');
  const [merchSearchTerm, setMerchSearchTerm] = useState('');

  const categories = ['All', ...new Set(publicEvents.map((event) => event.category))];
  const stockOptions = ['All availability', ...new Set(merchandise.map((item) => item.stock))];

  const filteredEvents = useMemo(() => {
    return publicEvents.filter((event) => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = [event.title, event.venue, event.category, event.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const filteredMerchandise = useMemo(() => {
    const query = merchSearchTerm.trim().toLowerCase();
    return merchandise.filter((item) => {
      const matchesStock = selectedStock === 'All availability' || item.stock === selectedStock;
      const matchesSearch = [item.name, item.description, item.stock, ...item.sizes]
        .some((value) => value.toLowerCase().includes(query));
      return matchesStock && matchesSearch;
    });
  }, [merchSearchTerm, selectedStock]);

  if (variant === 'events') {
    return (
      <div className="page-shell public-dashboard-page">
        <PublicNavbar />
        <section className="public-standalone-header">
          <div className="container public-standalone-header__inner">
            <div>
              <p className="eyebrow">Campus events</p>
              <h1>Discover what’s happening this month</h1>
            </div>
            <Link className="skyline-btn primary" to="/">
              Back home <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <main className="container public-list-page">
          <div className="public-filters" aria-label="Event filters">
            <div className="search-box">
              <Search size={16} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search events or venues"
                aria-label="Search events"
              />
            </div>
            <div className="filter-row">
              <Filter size={16} />
              <select
                aria-label="Filter events by category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="public-card-grid event-grid">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {filteredEvents.length === 0 && (
              <p className="empty-results" role="status">
                No events match those filters. Try another search or category.
              </p>
            )}
          </div>
        </main>

        <PublicFooter />
      </div>
    );
  }

  if (variant === 'merchandise') {
    return (
      <div className="page-shell public-dashboard-page public-merchandise-page">
        <PublicNavbar />
        <section className="public-standalone-header">
          <div className="container public-standalone-header__inner">
            <div>
              <p className="eyebrow">Merchandise</p>
              <h1>Build your Skyline essentials</h1>
            </div>
            <Link className="skyline-btn primary" to="/">
              Explore home <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <main className="container public-list-page">
          <div className="public-filters" aria-label="Merchandise filters">
            <div className="search-box">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={merchSearchTerm}
                onChange={(event) => setMerchSearchTerm(event.target.value)}
                placeholder="Search products, sizes, or details"
                aria-label="Search merchandise"
              />
            </div>
            <div className="filter-row">
              <Filter size={16} aria-hidden="true" />
              <select
                aria-label="Filter merchandise by stock status"
                value={selectedStock}
                onChange={(event) => setSelectedStock(event.target.value)}
              >
                {stockOptions.map((stock) => <option key={stock}>{stock}</option>)}
              </select>
            </div>
          </div>
          <div className="merchandise-grid">
            {filteredMerchandise.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
            {filteredMerchandise.length === 0 && (
              <p className="empty-results" role="status">No products match those filters. Try another search or availability status.</p>
            )}
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (variant === 'signin') {
    return <SignInPage />;
  }

  return (
    <div className="page-shell public-dashboard-page public-dashboard-home">
      <PublicNavbar />

      <main>
        <PublicHero />

        <div className="home-preview-stage">
          <div className="home-transition">
            <div className="home-transition__inner">
              <p className="home-handwritten">Real events. Real people.<br />A stronger campus.</p>
              <div className="skyline-stamp" aria-label="Skyline student organization">
                <svg viewBox="0 0 120 120" role="img" aria-hidden="true">
                  <defs><path id="skyline-stamp-circle" d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0" /></defs>
                  <circle cx="60" cy="60" r="55" />
                  <circle cx="60" cy="60" r="38" />
                  <text><textPath href="#skyline-stamp-circle">SKYLINE · STUDENT ORGANIZATION · </textPath></text>
                  <path d="m40 70 16-23 8 11 6-8 13 20H40Z" />
                  <path d="m53 70 11-16 12 16" />
                  <text className="stamp-year" x="60" y="82" textAnchor="middle">CAMPUS · EST. 2020</text>
                </svg>
              </div>
            </div>
          </div>
          <BrowserPreview />
        </div>

        <section id="featured-events" className="container public-section">
          <div className="public-heading-row">
            <div>
              <p className="eyebrow">Featured events</p>
              <h2 className="section-heading">A good reason to get out there.</h2>
            </div>
            <Link className="skyline-btn secondary" to="/events">
              Browse all events <ArrowRight size={16} />
            </Link>
          </div>
          <FeaturedEvents />
        </section>

        <section className="container public-section public-merch-section">
          <div className="public-heading-row">
            <div>
              <p className="eyebrow">Club essentials</p>
              <h2 className="section-heading">Made for the everyday campus loop.</h2>
            </div>
            <Link className="skyline-btn secondary" to="/merchandise">
              Shop collection <ArrowRight size={16} />
            </Link>
          </div>
          <MerchandisePreview />
        </section>

        <section className="container public-section community-strip">
          <div className="community-strip__content">
            <p className="eyebrow">Join the network</p>
            <h2 className="section-heading">Create a student life that feels connected.</h2>
            <p>
              From hack nights to wellness walks, Skyline helps students find opportunities, build projects, and explore campus culture together.
            </p>
          </div>
          <div className="community-strip__meta">
            <div>
              <CalendarRange size={20} />
              <span>Weekly event picks</span>
            </div>
            <div>
              <Sparkles size={20} />
              <span>Student-led communities</span>
            </div>
          </div>
        </section>

        <JoinClubCTA />
      </main>

      <PublicFooter />
    </div>
  );
}

export default PublicDashboard;
