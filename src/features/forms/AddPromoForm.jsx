import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';

export default function AddPromoForm() {
  const [promo, setPromo] = useState({
    promo_name: '',
    tag_id: '',
    promo_date_start: '',
    promo_date_end: '',
    promo_price_decrease: '',
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'tags'),
      (snapshot) => {
        const tagsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAvailableTags(tagsList);
      },
      (error) => {
        console.error('Error fetching tags:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    setPromo({ ...promo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    try {
      const querySnapshot = await getDocs(collection(db, 'promos'));
      const nextIndex = querySnapshot.size + 1;
      const customId = `PROMO-${String(nextIndex).padStart(3, '0')}`;

      await setDoc(doc(db, 'promos', customId), {
        promo_name: promo.promo_name,
        tag_id: promo.tag_id,
        promo_date_start: promo.promo_date_start,
        promo_date_end: promo.promo_date_end,
        promo_price_decrease: Number(promo.promo_price_decrease), // Stored as a decimal multiplier e.g. 0.15
        created_at: new Date().toISOString(),
      });

      setStatusMsg(`Promo created! ID: ${customId}`);

      setPromo({
        promo_name: '',
        tag_id: '',
        promo_date_start: '',
        promo_date_end: '',
        promo_price_decrease: '',
      });
    } catch (error) {
      console.error('Error adding promo:', error);
      setStatusMsg('Failed to create promo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add New Promo</h2>

      {statusMsg && <p>{statusMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="promo_name">Promo Name</label>
          <input
            id="promo_name"
            type="text"
            name="promo_name"
            value={promo.promo_name}
            onChange={handleInputChange}
            placeholder="e.g. Summer Special"
            required
          />
        </div>

        <div>
          <label htmlFor="tag_id">Target Tag</label>
          <select
            id="tag_id"
            name="tag_id"
            value={promo.tag_id}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Select a Tag --</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.tag_name || tag.name} ({tag.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="promo_date_start">Start Date</label>
          <input
            id="promo_date_start"
            type="date"
            name="promo_date_start"
            value={promo.promo_date_start}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="promo_date_end">End Date</label>
          <input
            id="promo_date_end"
            type="date"
            name="promo_date_end"
            value={promo.promo_date_end}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="promo_price_decrease">Discount Rate (Decimal: e.g. 0.15 for 15%)</label>
          <input
            id="promo_price_decrease"
            type="number"
            name="promo_price_decrease"
            value={promo.promo_price_decrease}
            onChange={handleInputChange}
            placeholder="e.g. 0.15"
            min="0"
            max="1"
            step="0.01"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Promo'}
        </button>
      </form>
    </div>
  );
}