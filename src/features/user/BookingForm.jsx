import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { discountedPrice, getSchedules } from '../../lib/pricing';

export default function BookingForm({ cruise, promo, onClose }) {
  const { currentUser } = useAuth();
  const schedules = useMemo(() => getSchedules(cruise), [cruise]);
  const [tierName, setTierName] = useState('');
  const [date, setDate] = useState('');
  const [bookings, setBookings] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('cruise_id', '==', cruise.id));
    return onSnapshot(q, (snap) => setBookings(snap.docs.map((d) => d.data())));
  }, [cruise.id]);

  const remaining = (tier, d) => {
    const taken = bookings.filter(
      (b) => b.tier_id === tier.tier_name && b.booking_date === d && b.status !== 'cancelled'
    ).length;
    return Math.max(0, Number(tier.tier_limit) - taken);
  };

  const tier = (cruise.tiers || []).find((t) => t.tier_name === tierName);
  const price = tier ? discountedPrice(tier.tier_price, promo) : 0;
  const slotsLeft = tier && date ? remaining(tier, date) : null;

  const submit = async (e) => {
    e.preventDefault();
    if (!tier || !date || slotsLeft < 1) return;
    setBusy(true);
    setMsg('');
    try {
      await addDoc(collection(db, 'bookings'), {
        user_id: currentUser.uid,
        cruise_id: cruise.id,
        tier_id: tier.tier_name,
        booking_date: date,
        price_paid: price,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      });
      onClose(true);
    } catch (err) {
      console.error(err);
      setMsg('Booking failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <fieldset>
        <legend>Book: {cruise.cruise_name}</legend>

        <div>
          <label htmlFor="book_tier">Cabin Tier</label>
          <select id="book_tier" value={tierName} onChange={(e) => setTierName(e.target.value)} required>
            <option value="">-- Select Tier --</option>
            {(cruise.tiers || []).map((t) => (
              <option key={t.tier_name} value={t.tier_name}>
                {t.tier_name} (₱{discountedPrice(t.tier_price, promo)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="book_date">Schedule</label>
          <select id="book_date" value={date} onChange={(e) => setDate(e.target.value)} required>
            <option value="">-- Select Date --</option>
            {schedules.map((d) => {
              const left = tier ? remaining(tier, d) : null;
              return (
                <option key={d} value={d} disabled={left === 0}>
                  {d}
                  {left !== null ? (left === 0 ? ' - Full' : ` - ${left} slots left`) : ''}
                </option>
              );
            })}
          </select>
        </div>

        {tier && (
          <p>
            Total: ₱{price}
            {promo && ` (${promo.promo_name} applied)`}
          </p>
        )}
        {msg && <p role="alert" className="font-moderustic text-p">{msg}</p>}

        <button type="submit" className="green" disabled={busy || !tier || !date || slotsLeft < 1}>
          {busy ? 'Booking...' : 'Confirm Booking'}
        </button>
        <button type="button" className="pink" onClick={() => onClose(false)}>Cancel</button>
      </fieldset>
    </form>
  );
}
