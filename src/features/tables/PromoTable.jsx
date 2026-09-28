import { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; // Adjust relative path as needed
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function PromoTable() {
  const [promos, setPromos] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [editingPromo, setEditingPromo] = useState(null);
  const [editFormData, setEditFormData] = useState({
    promo_name: '',
    tag_id: '',
    promo_date_start: '',
    promo_date_end: '',
    promo_price_decrease: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 1. Real-time listener for Promos collection
  useEffect(() => {
    const unsubscribePromos = onSnapshot(
      collection(db, 'promos'),
      (snapshot) => {
        const promoList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPromos(promoList);
      },
      (error) => {
        console.error('Error fetching promos:', error);
      }
    );

    return () => unsubscribePromos();
  }, []);

  // 2. Real-time listener for Tags (to map Tag IDs to names)
  useEffect(() => {
    const unsubscribeTags = onSnapshot(
      collection(db, 'tags'),
      (snapshot) => {
        const tagList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAvailableTags(tagList);
      },
      (error) => {
        console.error('Error fetching tags:', error);
      }
    );

    return () => unsubscribeTags();
  }, []);

  // Start Editing a Promo
  const handleEditClick = (promo) => {
    setEditingPromo(promo);
    setEditFormData({
      promo_name: promo.promo_name || '',
      tag_id: promo.tag_id || '',
      promo_date_start: promo.promo_date_start || '',
      promo_date_end: promo.promo_date_end || '',
      promo_price_decrease: promo.promo_price_decrease || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingPromo(null);
    setEditFormData({
      promo_name: '',
      tag_id: '',
      promo_date_start: '',
      promo_date_end: '',
      promo_price_decrease: '',
    });
  };

  const handleInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Save Promo Updates to Firestore
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    try {
      await setDoc(
        doc(db, 'promos', editingPromo.id),
        {
          promo_name: editFormData.promo_name,
          tag_id: editFormData.tag_id,
          promo_date_start: editFormData.promo_date_start,
          promo_date_end: editFormData.promo_date_end,
          promo_price_decrease: Number(editFormData.promo_price_decrease),
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      setStatusMsg(`Promo ${editingPromo.id} updated successfully.`);
      setEditingPromo(null);
    } catch (error) {
      console.error('Error updating promo:', error);
      setStatusMsg('Failed to update promo.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Promo
  const handleDeleteClick = async (id) => {
    if (!window.confirm(`Are you sure you want to delete promo ${id}?`)) return;

    setLoading(true);
    setStatusMsg('');

    try {
      await deleteDoc(doc(db, 'promos', id));
      setStatusMsg(`Promo ${id} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting promo:', error);
      setStatusMsg('Failed to delete promo.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to resolve tag name from tag_id
  const getTagName = (tagId) => {
    const tag = availableTags.find((t) => t.id === tagId);
    return tag ? tag.tag_name || tag.name : tagId;
  };

  return (
    <div>
      <h2>Manage Promos</h2>

      {statusMsg && <p>{statusMsg}</p>}

      {/* Edit Form */}
      {editingPromo && (
        <fieldset>
          <legend>Editing Promo: {editingPromo.id}</legend>
          <form onSubmit={handleSaveUpdate}>
            <div>
              <label htmlFor="edit_promo_name">Promo Name</label>
              <input
                id="edit_promo_name"
                type="text"
                name="promo_name"
                value={editFormData.promo_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="edit_tag_id">Target Tag</label>
              <select
                id="edit_tag_id"
                name="tag_id"
                value={editFormData.tag_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select Tag --</option>
                {availableTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.tag_name || tag.name} ({tag.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit_promo_date_start">Start Date</label>
              <input
                id="edit_promo_date_start"
                type="date"
                name="promo_date_start"
                value={editFormData.promo_date_start}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="edit_promo_date_end">End Date</label>
              <input
                id="edit_promo_date_end"
                type="date"
                name="promo_date_end"
                value={editFormData.promo_date_end}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="edit_promo_price_decrease">Discount Rate (Decimal: e.g. 0.15)</label>
              <input
                id="edit_promo_price_decrease"
                type="number"
                name="promo_price_decrease"
                value={editFormData.promo_price_decrease}
                onChange={handleInputChange}
                min="0"
                max="1"
                step="0.01"
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Update Promo'}
            </button>
            <button type="button" onClick={handleCancelEdit} disabled={loading}>
              Cancel
            </button>
          </form>
        </fieldset>
      )}

      {/* Promos Table */}
      {promos.length === 0 ? (
        <p>No promos found in the database.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Promo Name</th>
              <th>Target Tag</th>
              <th>Discount Rate</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((promo) => (
              <tr key={promo.id}>
                <td>{promo.id}</td>
                <td>{promo.promo_name}</td>
                <td>{getTagName(promo.tag_id)}</td>
                <td>
                  {promo.promo_price_decrease
                    ? `${(promo.promo_price_decrease * 100).toFixed(0)}% (${promo.promo_price_decrease})`
                    : 'N/A'}
                </td>
                <td>{promo.promo_date_start}</td>
                <td>{promo.promo_date_end}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleEditClick(promo)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(promo.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}