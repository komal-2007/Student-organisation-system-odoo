import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/events', label: 'Events' },
    { to: '/merchandise', label: 'Merchandise' },
  ];

  return (
    <header className="public-header">
      <div className="container public-header__inner">
        <Link className="brand" to="/" aria-label="Skyline home">
          <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
            <path d="M4 30.5 14.5 14l5 7.2 4-5.8L36 30.5H4Z" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
            <path d="m12.1 30.5 7.5-11.2 7.8 11.2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".7" />
          </svg>
          <span className="brand-wordmark">SKYLINE</span>
        </Link>

        <nav
          id="public-navigation"
          className={`public-nav ${menuOpen ? 'is-open' : ''}`}
          aria-label="Main navigation"
          onKeyDown={(event) => {
            if (event.key === 'Escape') setMenuOpen(false);
          }}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <Link className="mobile-signin-link" to="/signin" onClick={() => setMenuOpen(false)}>Sign In</Link>
        </nav>

        <Link className="header-signin" to="/signin">Sign In</Link>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}

export default PublicNavbar;
