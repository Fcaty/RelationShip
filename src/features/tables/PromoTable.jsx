import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import PromoForm from '../forms/PromoForm'; // Import the PromoForm component

export default function PromoTable() {
  const [promos, setPromos] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [editingPromo, setEditingPromo] = useState(null);

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

  // Start Editing: set selected promo object to pass into PromoForm
  const handleEditClick = (promo) => {
    setEditingPromo(promo);
  };

  const handleCloseEdit = () => {
    setEditingPromo(null);
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

      {/* Render PromoForm counterpart when editing a row */}
      {editingPromo && (
        <fieldset style={{ marginBottom: '20px' }}>
          <legend>Edit Promo Counterpart</legend>
          <PromoForm
            initialData={editingPromo}
            onSuccess={() => {
              setEditingPromo(null);
              setStatusMsg(`Promo ${editingPromo.id} updated successfully.`);
            }}
          />
          <button type="button" onClick={handleCloseEdit} style={{ marginTop: '10px' }}>
            Cancel Edit
          </button>
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