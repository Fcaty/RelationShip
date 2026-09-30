import { useAuth } from '../context/AuthContext';

export default function Navig({ variant, className = 'header-nav', ariaLabel }) {
  const { currentUser, logout } = useAuth();
  const resolvedVariant = variant ?? (currentUser ? 'logged-in' : 'guest');
  const isLoggedIn = resolvedVariant === 'logged-in';

  return (
    <nav className={className} aria-label={ariaLabel ?? (isLoggedIn ? 'Authenticated navigation' : 'Guest navigation')}>
      {isLoggedIn ? (
        <>
          <button type="button" className="texthover">Browse Cruises</button>
          <button type="button" className="texthover">My Bookings</button>
          <button type="button" className="texthover">My Account</button>
          <button type="button" className="texthover" onClick={logout}>Log Out</button>
        </>
      ) : (
        <>
          <button type="button" className="texthover">Home</button>
          <button type="button" className="texthover">Find a Cruise</button>
          <button type="button" className="texthover">About Us</button>
          <button type="button" className="texthover">Login</button>
        </>
      )}
    </nav>
  );
}