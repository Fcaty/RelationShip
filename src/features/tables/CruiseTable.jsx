import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import CruiseForm from '../forms/CruiseForm'; // Import your cruise form component

export default function CruiseTable() {
  const [cruises, setCruises] = useState([]);
  const [editingCruise, setEditingCruise] = useState(null); // Tracks the cruise currently being edited
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Real-time listener for cruises
  useEffect(() => {
    const unsubscribe = onSnapshot(
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

    return () => unsubscribe();
  }, []);

  // Delete cruise from Firestore
  const handleDeleteClick = async (id) => {
    if (!window.confirm(`Are you sure you want to delete cruise ${id}?`)) return;

    setLoading(true);
    setStatusMsg('');

    try {
      await deleteDoc(doc(db, 'cruises', id));
      setStatusMsg(`Cruise ${id} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting cruise:', error);
      setStatusMsg('Failed to delete cruise.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Manage Cruises</h2>

      {statusMsg && <p>{statusMsg}</p>}

      {/* Reused Cruise Form in Edit Mode */}
      {editingCruise && (
        <fieldset>
          <legend>Editing Cruise: {editingCruise.id}</legend>
          <button type="button" onClick={() => setEditingCruise(null)}>
            Close Edit Form
          </button>
          
          <CruiseForm 
            initialData={editingCruise} 
            onSuccess={() => setEditingCruise(null)} 
          />
        </fieldset>
      )}

      {cruises.length === 0 ? (
        <p>No cruises found in the database.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Destination</th>
              <th>Departure Port</th>
              <th>Description</th>
              <th>Tiers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cruises.map((cruise) => (
              <tr key={cruise.id}>
                <td>{cruise.id}</td>
                <td>{cruise.cruise_name}</td>
                <td>{cruise.cruise_destination}</td>
                <td>{cruise.cruise_port}</td>
                <td>{cruise.cruise_description}</td>
                <td>
                  {cruise.tiers && cruise.tiers.length > 0 ? (
                    <ul>
                      {cruise.tiers.map((tier, idx) => (
                        <li key={idx}>
                          {tier.tier_name}: ${tier.tier_price} ({tier.tier_limit} slots)
                        </li>
                      ))}
                    </ul>
                  ) : (
                    'None'
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => setEditingCruise(cruise)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(cruise.id)}
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