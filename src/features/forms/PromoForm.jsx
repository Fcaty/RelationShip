import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, setDoc, getDocs } from 'firebase/firestore';

export default function PromoForm({ initialData = null, onSuccess = null }) {
  const isEditMode = Boolean(initialData);

  const [promo, setPromo] = useState({
    promo_name: initialData?.promo_name || '',
    tag_id: initialData?.tag_id || '',
    promo_date_start: initialData?.promo_date_start || '',
    promo_date_end: initialData?.promo_date_end || '',
    promo_price_decrease: initialData?.promo_price_decrease ?? '',
  });

  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Sync state if initialData changes (e.g. switching items to edit)
  useEffect(() => {
    if (initialData) {
      setPromo({
        promo_name: initialData.promo_name || '',
        tag_id: initialData.tag_id || '',
        promo_date_start: initialData.promo_date_start || '',
        promo_date_end: initialData.promo_date_end || '',
        promo_price_decrease: initialData.promo_price_decrease ?? '',
      });
    }
  }, [initialData]);

  // Real-time listener for tags dropdown options
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
      let targetDocId = initialData?.id;

      // Auto-generate custom ID if creating a new promo
      if (!isEditMode) {
        const querySnapshot = await getDocs(collection(db, 'promos'));
        const nextIndex = querySnapshot.size + 1;
        targetDocId = `PROMO-${String(nextIndex).padStart(3, '0')}`;
      }

      await setDoc(
        doc(db, 'promos', targetDocId),
        {
          promo_name: promo.promo_name,
          tag_id: promo.tag_id,
          promo_date_start: promo.promo_date_start,
          promo_date_end: promo.promo_date_end,
          promo_price_decrease: Number(promo.promo_price_decrease),
          updated_at: new Date().toISOString(),
          ...(isEditMode ? {} : { created_at: new Date().toISOString() }),
        },
        { merge: true }
      );

      setStatusMsg(`Promo ${isEditMode ? 'updated' : 'created'}! ID: ${targetDocId}`);

      if (!isEditMode) {
        setPromo({
          promo_name: '',
          tag_id: '',
          promo_date_start: '',
          promo_date_end: '',
          promo_price_decrease: '',
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving promo:', error);
      setStatusMsg('Failed to save promo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isEditMode ? `Edit Promo (${initialData.id})` : 'Add New Promo'}</h2>

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
          {loading ? 'Saving...' : isEditMode ? 'Update Promo' : 'Add Promo'}
        </button>
      </form>
    </div>
  );
}