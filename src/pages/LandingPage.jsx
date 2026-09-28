import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import AuthPanel from '../features/user/AuthPanel';
import { lowestTierPrice } from '../lib/pricing';

export default function LandingPage() {
  const [cruises, setCruises] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, 'cruises'), (snap) =>
      setCruises(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  return (
    <div>
      <section style={{ borderBottom: '2px solid black' }}>
        <h1>Cruise Booking</h1>
        <p>Browse our cruises below. Sign in or register to book.</p>
      </section>

      <section style={{ borderBottom: '2px solid black' }}>
        <AuthPanel />
      </section>

      <section>
        <h2>Available Cruises</h2>
        {cruises.length === 0 && <p>No cruises available yet.</p>}
        {cruises.map((c) => {
          const low = lowestTierPrice(c);
          return (
            <fieldset key={c.id}>
              <legend>{c.cruise_name}</legend>
              <div>Destination: {c.cruise_destination}</div>
              <div>Departure Port: {c.cruise_port}</div>
              <div>{c.cruise_description}</div>
              <div>From ₱{Number.isFinite(low) ? low : '—'}</div>
            </fieldset>
          );
        })}
      </section>
    </div>
  );
}
