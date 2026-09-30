import { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; // Adjust relative path as needed
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function BookingTable() {
  const [bookings, setBookings] = useState([]);
  const [cruises, setCruises] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    user_id: '',
    cruise_id: '',
    tier_id: '',
    booking_date: '',
    price_paid: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 1. Real-time listener for Bookings
  useEffect(() => {
    const unsubscribeBookings = onSnapshot(
      collection(db, 'bookings'),
      (snapshot) => {
        const bookingList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingList);
      },
      (error) => {
        console.error('Error fetching bookings:', error);
      }
    );

    return () => unsubscribeBookings();
  }, []);

  // 2. Real-time listener for Cruises (to resolve Cruise and Tier names)
  useEffect(() => {
    const unsubscribeCruises = onSnapshot(
      collection(db, 'cruises'),
      (snapshot) => {
        const cruiseList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCruises(cruiseList);
      },
      (error) => {
        console.error('Error fetching cruises:', error);
      }
    );

    return () => unsubscribeCruises();
  }, []);

  // Helpers to look up names
  const getCruiseName = (cruiseId) => {
    const cruise = cruises.find((c) => c.id === cruiseId);
    return cruise ? cruise.cruise_name : cruiseId;
  };

  const getAvailableTiersForCruise = (cruiseId) => {
    const cruise = cruises.find((c) => c.id === cruiseId);
    return cruise?.tiers || [];
  };

  // Start Editing
  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setEditFormData({
      user_id: booking.user_id || '',
      cruise_id: booking.cruise_id || '',
      tier_id: booking.tier_id || '',
      booking_date: booking.booking_date || '',
      price_paid: booking.price_paid || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setEditFormData({
      user_id: '',
      cruise_id: '',
      tier_id: '',
      booking_date: '',
      price_paid: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Reset tier_id if cruise_id changes during edit
    if (name === 'cruise_id') {
      setEditFormData((prev) => ({
        ...prev,
        cruise_id: value,
        tier_id: '',
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Save Booking Updates to Firestore
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    try {
      await setDoc(
        doc(db, 'bookings', editingBooking.id),
        {
          user_id: editFormData.user_id,
          cruise_id: editFormData.cruise_id,
          tier_id: editFormData.tier_id,
          booking_date: editFormData.booking_date,
          price_paid: Number(editFormData.price_paid),
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      setStatusMsg(`Booking ${editingBooking.id} updated successfully.`);
      setEditingBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      setStatusMsg('Failed to update booking.');
    } finally {
      setLoading(false);
    }
  };

  // Delete Booking
  const handleDeleteClick = async (id) => {
    if (!window.confirm(`Are you sure you want to delete booking ${id}?`)) return;

    setLoading(true);
    setStatusMsg('');

    try {
      await deleteDoc(doc(db, 'bookings', id));
      setStatusMsg(`Booking ${id} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting booking:', error);
      setStatusMsg('Failed to delete booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="manage-bookings-heading">
      <h2 id="manage-bookings-heading" className="text-n">Manage Bookings</h2>

      {statusMsg && <p role="status" className="font-moderustic text-n">{statusMsg}</p>}

      {/* Edit Form Drawer */}
      {editingBooking && (
        <fieldset>
          <legend>Editing Booking: {editingBooking.id}</legend>
          <form onSubmit={handleSaveUpdate}>
            <div>
              <label htmlFor="edit_user_id">User ID</label>
              <input
                id="edit_user_id"
                type="text"
                name="user_id"
                value={editFormData.user_id}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="edit_cruise_id">Cruise</label>
              <select
                id="edit_cruise_id"
                name="cruise_id"
                value={editFormData.cruise_id}
                onChange={handleInputChange}
                required
              >
                <option value="">-- Select Cruise --</option>
                {cruises.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cruise_name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit_tier_id">Cabin Tier</label>
              <select
                id="edit_tier_id"
                name="tier_id"
                value={editFormData.tier_id}
                onChange={handleInputChange}
                required
                disabled={!editFormData.cruise_id}
              >
                <option value="">-- Select Tier --</option>
                {getAvailableTiersForCruise(editFormData.cruise_id).map((t, idx) => (
                  <option key={idx} value={t.tier_name}>
                    {t.tier_name} (₱{t.tier_price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit_booking_date">Booking Date</label>
              <input
                id="edit_booking_date"
                type="date"
                name="booking_date"
                value={editFormData.booking_date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="edit_price_paid">Price Paid (₱)</label>
              <input
                id="edit_price_paid"
                type="number"
                name="price_paid"
                value={editFormData.price_paid}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <button type="submit" className="green" disabled={loading}>
              {loading ? 'Saving...' : 'Update Booking'}
            </button>
            <button type="button" className="pink" onClick={handleCancelEdit} disabled={loading}>
              Cancel
            </button>
          </form>
        </fieldset>
      )}

      {/* Bookings Table */}
      {bookings.length === 0 ? (
        <p>No bookings found in the database.</p>
      ) : (
        <table className="w-full border-collapse text-left font-moderustic text-n">
          <caption className="sr-only">Booking records</caption>
          <thead className="bg-n text-w">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">ID</th>
              <th scope="col" className="px-3 py-2 text-left">User ID</th>
              <th scope="col" className="px-3 py-2 text-left">Cruise</th>
              <th scope="col" className="px-3 py-2 text-left">Tier</th>
              <th scope="col" className="px-3 py-2 text-left">Booking Date</th>
              <th scope="col" className="px-3 py-2 text-left">Price Paid</th>
              <th scope="col" className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-b/30">
                <td className="px-3 py-2">{b.id}</td>
                <td className="px-3 py-2">{b.user_id}</td>
                <td className="px-3 py-2">{getCruiseName(b.cruise_id)} ({b.cruise_id})</td>
                <td className="px-3 py-2">{b.tier_id}</td>
                <td className="px-3 py-2">{b.booking_date}</td>
                <td className="px-3 py-2">${Number(b.price_paid || 0).toFixed(2)}</td>
                <td className="space-x-2 px-3 py-2">
                  <button
                    type="button"
                    className="blue"
                    onClick={() => handleEditClick(b)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="pink"
                    onClick={() => handleDeleteClick(b.id)}
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