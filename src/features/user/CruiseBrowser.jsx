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
    <section aria-labelledby="browse-cruises-heading">
      <h2 id="browse-cruises-heading" className="text-n">Browse Cruises</h2>
      {toast && <p role="status" className="font-moderustic text-g">{toast}</p>}

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
          <article key={cruise.id} className="space-y-3 border-b border-b/30 py-5">
            <h3 className="text-n">{cruise.cruise_name}</h3>
            {cruise.cruise_image_url && (
              <img src={cruise.cruise_image_url} alt={cruise.cruise_name} className="h-48 w-full max-w-sm object-cover" />
            )}
            <dl className="grid gap-2 font-moderustic sm:grid-cols-2">
              <div><dt className="font-semibold">Destination</dt><dd>{cruise.cruise_destination}</dd></div>
              <div><dt className="font-semibold">Departure Port</dt><dd>{cruise.cruise_port}</dd></div>
              {cruise.cruise_description && <div className="sm:col-span-2"><dt className="font-semibold">About</dt><dd>{cruise.cruise_description}</dd></div>}
              <div><dt className="font-semibold">Tags</dt><dd>{(cruise.tag_ids || [])
                .map((id) => tags.find((tag) => tag.id === id))
                .filter(Boolean)
                .map((tag) => tag.tag_name || tag.name)
                .join(', ') || 'None'}</dd></div>
              {promo && <div><dt className="font-semibold">Promo</dt><dd>{promo.promo_name}</dd></div>}
            </dl>
            <p className="font-moderustic">
              From {promo && hasPrice && <s>₱{low}</s>} ₱{hasPrice ? discountedPrice(low, promo) : '—'}
            </p>
            <button type="button" className="green" onClick={() => setBooking({ cruise, promo })}>Book</button>
          </article>
        );
      })}
    </section>
  );
}
