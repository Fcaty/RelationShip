import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import Header from '../components/Header';
import CruiseBrowser from '../features/user/CruiseBrowser';
import MyBookings from '../features/user/MyBookings';
import { lowestTierPrice } from '../lib/pricing';

export default function LandingPage({ isAuthenticated = false }) {
  const [cruises, setCruises] = useState([]);
  const [tab, setTab] = useState('browse');

  useEffect(() => {
    return onSnapshot(collection(db, 'cruises'), (snap) =>
      setCruises(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  if (isAuthenticated) {
    return (
      <div className="flex flex-col">
        <Header variant="logged-in" />

        <main className="flex-1 p-6 text-n">
          <h1 className="pb-4">My Cruise Account</h1>

          <div className="flex flex-wrap gap-2 pb-4" role="group" aria-label="Account views">
            <button id="browse-tab" type="button" aria-pressed={tab === 'browse'} aria-controls="account-panel" className={`blue ${tab === 'browse' ? '' : 'opacity-70'}`} onClick={() => setTab('browse')}>
              Browse Cruises
            </button>
            <button id="bookings-tab" type="button" aria-pressed={tab === 'bookings'} aria-controls="account-panel" className={`blue ${tab === 'bookings' ? '' : 'opacity-70'}`} onClick={() => setTab('bookings')}>
              My Bookings
            </button>
          </div>

          <section id="account-panel" aria-labelledby={tab === 'browse' ? 'browse-tab' : 'bookings-tab'}>
            {tab === 'browse' ? <CruiseBrowser /> : <MyBookings />}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header variant="guest" />

      <main className="flex-1 text-n">

        <section aria-labelledby="available-cruises-title" className="space-y-4 px-6 py-8 sm:px-12">
          <h2 id="available-cruises-title" className="text-n">Available Cruises</h2>
          {cruises.length === 0 && <p className="font-moderustic">No cruises available yet.</p>}
          {cruises.map((cruise) => {
            const low = lowestTierPrice(cruise);
            return (
              <article key={cruise.id} className="space-y-3 border-b border-b/30 py-4">
                <h3 className="text-n">{cruise.cruise_name}</h3>
                <dl className="grid gap-2 font-moderustic sm:grid-cols-2">
                  <div><dt className="font-semibold">Destination</dt><dd>{cruise.cruise_destination}</dd></div>
                  <div><dt className="font-semibold">Departure Port</dt><dd>{cruise.cruise_port}</dd></div>
                  {cruise.cruise_description && <div className="sm:col-span-2"><dt className="font-semibold">About</dt><dd>{cruise.cruise_description}</dd></div>}
                </dl>
                <p className="font-moderustic font-semibold">From ₱{Number.isFinite(low) ? low : '—'}</p>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
