import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FloatingAuthWindow from './FloatingAuthWindow';
import LoginForm from '../features/forms/LoginForm';
import RegisterForm from '../features/forms/RegisterForm';

export default function Navig({ variant, className = 'header-nav', ariaLabel }) {
  const { currentUser, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const resolvedVariant = variant ?? (currentUser ? 'logged-in' : 'guest');
  const isLoggedIn = resolvedVariant === 'logged-in';

  return (
    <>
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
            <button type="button" className="texthover" onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}>
              Login
            </button>
          </>
        )}
      </nav>

      {showAuthModal && (
        <FloatingAuthWindow
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setShowAuthModal(false)}
          isSubmitting={authSubmitting}
        >
          {authMode === 'login'
            ? <LoginForm onLoadingChange={setAuthSubmitting} />
            : <RegisterForm onLoadingChange={setAuthSubmitting} onSuccess={() => setAuthMode('login')} />}
        </FloatingAuthWindow>
      )}
    </>
  );
}