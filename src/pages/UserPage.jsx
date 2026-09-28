import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CruiseBrowser from '../features/user/CruiseBrowser';
import MyBookings from '../features/user/MyBookings';

export default function UserPage() {
  const { currentUser, logout } = useAuth();
  const [tab, setTab] = useState('browse');

  return (
    <div>
      <header>
        <h1>Cruise Booking</h1>
        <span>{currentUser.email} </span>
        <button type="button" onClick={logout}>Log Out</button>
      </header>

      <nav>
        <button type="button" onClick={() => setTab('browse')} style={{ fontWeight: tab === 'browse' ? 'bold' : 'normal' }}>
          Browse Cruises
        </button>
        <button type="button" onClick={() => setTab('bookings')} style={{ fontWeight: tab === 'bookings' ? 'bold' : 'normal' }}>
          My Bookings
        </button>
      </nav>

      <main>{tab === 'browse' ? <CruiseBrowser /> : <MyBookings />}</main>
    </div>
  );
}
