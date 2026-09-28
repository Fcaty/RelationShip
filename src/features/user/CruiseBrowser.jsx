import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { discountedPrice, getActivePromo, lowestTierPrice } from '../../lib/pricing';
import BookingForm from './BookingForm';

const useCollection = (name) => {
  const [items, setItems] = useState([]);
  useEffect(
    () => onSnapshot(collection(db, name), (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
    [name]
  );
  return items;
};

export default function CruiseBrowser() {
  const cruises = useCollection('cruises');
  const tags = useCollection('tags');
  const promos = useCollection('promos');

  const [location, setLocation] = useState('');
  const [tagId, setTagId] = useState('');
  const [promoOnly, setPromoOnly] = useState(false);
  const [booking, setBooking] = useState(null);
  const [toast, setToast] = useState('');

  const locations = useMemo(
    () => [...new Set(cruises.flatMap((c) => [c.cruise_destination, c.cruise_port]).filter(Boolean))].sort(),
    [cruises]
  );

  const rows = cruises
    .map((c) => ({ cruise: c, promo: getActivePromo(c, promos) }))
    .filter(
      ({ cruise, promo }) =>
        (!location || cruise.cruise_destination === location || cruise.cruise_port === location) &&
        (!tagId || (cruise.tag_ids || []).includes(tagId)) &&
        (!promoOnly || promo)
    );

  return (
    <div>
      <h2>Browse Cruises</h2>
      {toast && <p>{toast}</p>}

      <fieldset>
        <legend>Filters</legend>
        <label htmlFor="f_location">Location</label>
        <select id="f_location" value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <label htmlFor="f_tag">Tag</label>
        <select id="f_tag" value={tagId} onChange={(e) => setTagId(e.target.value)}>
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>{t.tag_name || t.name}</option>
          ))}
        </select>

        <label>
          <input type="checkbox" checked={promoOnly} onChange={(e) => setPromoOnly(e.target.checked)} />
          Currently with promo
        </label>
      </fieldset>

      {booking && (
        <BookingForm
          cruise={booking.cruise}
          promo={booking.promo}
          onClose={(ok) => {
            setBooking(null);
            if (ok) {
              setToast('Booking confirmed! See it under My Bookings.');
              setTimeout(() => setToast(''), 4000);
            }
          }}
        />
      )}

      {rows.length === 0 && <p>No cruises match your filters.</p>}
      {rows.map(({ cruise, promo }) => {
        const low = lowestTierPrice(cruise);
        const hasPrice = Number.isFinite(low);
        return (
          <fieldset key={cruise.id}>
            <legend>{cruise.cruise_name}</legend>
            {cruise.cruise_image_url && (
              <img src={cruise.cruise_image_url} alt={cruise.cruise_name} width="200" />
            )}
            <div>Destination: {cruise.cruise_destination}</div>
            <div>Departure Port: {cruise.cruise_port}</div>
            <div>{cruise.cruise_description}</div>
            <div>
              Tags:{' '}
              {(cruise.tag_ids || [])
                .map((id) => tags.find((t) => t.id === id))
                .filter(Boolean)
                .map((t) => t.tag_name || t.name)
                .join(', ')}
            </div>
            {promo && <div>Promo: {promo.promo_name}</div>}
            <div>
              From {promo && hasPrice && <s>₱{low}</s>} ₱{hasPrice ? discountedPrice(low, promo) : '—'}
            </div>
            <button type="button" onClick={() => setBooking({ cruise, promo })}>Book</button>
          </fieldset>
        );
      })}
    </div>
  );
}
