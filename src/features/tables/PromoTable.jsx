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
    <section aria-labelledby="manage-promos-heading">
      <h2 id="manage-promos-heading" className="text-n">Manage Promos</h2>

      {statusMsg && <p role="status" className="font-moderustic text-n">{statusMsg}</p>}

      {/* Render PromoForm counterpart when editing a row */}
      {editingPromo && (
        <fieldset className="mb-5">
          <legend>Edit Promo Counterpart</legend>
          <PromoForm
            initialData={editingPromo}
            onSuccess={() => {
              setEditingPromo(null);
              setStatusMsg(`Promo ${editingPromo.id} updated successfully.`);
            }}
          />
          <button type="button" className="pink mt-3" onClick={handleCloseEdit}>
            Cancel Edit
          </button>
        </fieldset>
      )}

      {/* Promos Table */}
      {promos.length === 0 ? (
        <p>No promos found in the database.</p>
      ) : (
        <table className="w-full border-collapse text-left font-moderustic text-n">
          <caption className="sr-only">Promotions</caption>
          <thead className="bg-n text-w">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">ID</th>
              <th scope="col" className="px-3 py-2 text-left">Promo Name</th>
              <th scope="col" className="px-3 py-2 text-left">Target Tag</th>
              <th scope="col" className="px-3 py-2 text-left">Discount Rate</th>
              <th scope="col" className="px-3 py-2 text-left">Start Date</th>
              <th scope="col" className="px-3 py-2 text-left">End Date</th>
              <th scope="col" className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((promo) => (
              <tr key={promo.id} className="border-b border-b/30">
                <td className="px-3 py-2">{promo.id}</td>
                <td className="px-3 py-2">{promo.promo_name}</td>
                <td className="px-3 py-2">{getTagName(promo.tag_id)}</td>
                <td className="px-3 py-2">
                  {promo.promo_price_decrease
                    ? `${(promo.promo_price_decrease * 100).toFixed(0)}% (${promo.promo_price_decrease})`
                    : 'N/A'}
                </td>
                <td className="px-3 py-2">{promo.promo_date_start}</td>
                <td className="px-3 py-2">{promo.promo_date_end}</td>
                <td className="space-x-2 px-3 py-2">
                  <button
                    type="button"
                    className="blue"
                    onClick={() => handleEditClick(promo)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="pink"
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
    </section>
  );
}