import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function JoinClubCTA() {
  return (
    <section id="join" className="join-cta section-shell">
      <div className="container join-cta__inner">
        <div>
          <p className="eyebrow">Membership</p>
          <h2>Ready to join the next chapter of campus life?</h2>
        </div>
        <div className="join-cta__content">
          <p>
            Discover events, connect with students, and get involved in projects that make campus communities more vibrant.
          </p>
          <Link className="skyline-btn primary" to="/signin">
            Join the Club <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default JoinClubCTA;
