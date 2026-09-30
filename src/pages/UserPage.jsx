import { useState } from 'react';
import Header from '../components/Header';
import CruiseBrowser from '../features/user/CruiseBrowser';
import MyBookings from '../features/user/MyBookings';

export default function UserPage() {
  const [tab, setTab] = useState('browse');

  return (
    <div>
      <Header variant="logged-in" />

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
