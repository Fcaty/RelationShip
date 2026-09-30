import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

export default function MyBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [cruises, setCruises] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('user_id', '==', currentUser.uid));
    return onSnapshot(q, (s) => setBookings(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [currentUser.uid]);

  useEffect(
    () => onSnapshot(collection(db, 'cruises'), (s) => setCruises(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
    []
  );

  const cruiseName = (id) => cruises.find((c) => c.id === id)?.cruise_name || id;

  const cancel = async (b) => {
    if (!window.confirm('Cancel this booking?')) return;
    await updateDoc(doc(db, 'bookings', b.id), {
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    });
  };

  const sorted = [...bookings].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  return (
    <section aria-labelledby="my-bookings-heading">
      <h2 id="my-bookings-heading" className="text-n">My Bookings</h2>
      {sorted.length === 0 && <p>You have no bookings yet.</p>}
      {sorted.length > 0 && (
        <table className="w-full border-collapse text-left font-moderustic text-n">
          <caption className="sr-only">Your cruise bookings</caption>
          <thead className="bg-n text-w">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">Cruise</th>
              <th scope="col" className="px-3 py-2 text-left">Cabin Tier</th>
              <th scope="col" className="px-3 py-2 text-left">Date</th>
              <th scope="col" className="px-3 py-2 text-left">Price Paid</th>
              <th scope="col" className="px-3 py-2 text-left">Status</th>
              <th scope="col" className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => (
              <tr key={b.id} className="border-b border-b/30">
                <td className="px-3 py-2">{cruiseName(b.cruise_id)}</td>
                <td className="px-3 py-2">{b.tier_id}</td>
                <td className="px-3 py-2">{b.booking_date}</td>
                <td className="px-3 py-2">₱{b.price_paid}</td>
                <td className="px-3 py-2">{b.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}</td>
                <td className="px-3 py-2">
                  {b.status !== 'cancelled' && (
                    <button type="button" className="pink" onClick={() => cancel(b)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
