import { Link } from 'react-router-dom';

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container public-footer__inner">
        <div>
          <h3>Skyline</h3>
          <p>Student life, events, and community in one place.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          <Link to="/merchandise">Merchandise</Link>
          <Link to="/signin">Sign In</Link>
        </nav>
      </div>
    </footer>
  );
}

export default PublicFooter;
