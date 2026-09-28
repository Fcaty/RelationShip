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
    <div>
      <h2>My Bookings</h2>
      {sorted.length === 0 && <p>You have no bookings yet.</p>}
      {sorted.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Cruise</th>
              <th>Cabin Tier</th>
              <th>Date</th>
              <th>Price Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => (
              <tr key={b.id}>
                <td>{cruiseName(b.cruise_id)}</td>
                <td>{b.tier_id}</td>
                <td>{b.booking_date}</td>
                <td>₱{b.price_paid}</td>
                <td>{b.status === 'cancelled' ? 'Cancelled' : 'Confirmed'}</td>
                <td>
                  {b.status !== 'cancelled' && (
                    <button type="button" onClick={() => cancel(b)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
