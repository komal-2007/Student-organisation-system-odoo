import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicImage from './PublicImage';

function PublicHero() {
  return (
    <section className="public-hero" aria-labelledby="public-hero-title">
      <PublicImage
        className="public-hero__backdrop"
        fetchPriority="high"
        src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=2200&q=85"
        alt=""
      />
      <div className="container public-hero__inner">
        <div className="public-hero__content">
          <p className="eyebrow">Made for campus life</p>
          <h1 id="public-hero-title">Your club.<br />All in <span>one place.</span></h1>
          <p className="public-hero__copy">
            Discover campus events, find your people, and explore Skyline merchandise.
          </p>
          <div className="public-hero__actions">
            <Link className="skyline-btn primary" to="/events">
              Explore Events <ArrowRight size={17} />
            </Link>
            <Link className="skyline-btn secondary" to="/merchandise">
              <ShoppingBag size={17} /> Explore Merchandise
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PublicHero;
