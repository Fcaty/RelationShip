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
    <section aria-labelledby="manage-cruises-heading">
      <h2 id="manage-cruises-heading" className="text-n">Manage Cruises</h2>

      {statusMsg && <p role="status" className="font-moderustic text-n">{statusMsg}</p>}

      {/* Reused Cruise Form in Edit Mode */}
      {editingCruise && (
        <fieldset>
          <legend>Editing Cruise: {editingCruise.id}</legend>
          <button type="button" className="pink" onClick={() => setEditingCruise(null)}>
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
        <table className="w-full border-collapse text-left font-moderustic text-n">
          <caption className="sr-only">Cruise inventory</caption>
          <thead className="bg-n text-w">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">ID</th>
              <th scope="col" className="px-3 py-2 text-left">Name</th>
              <th scope="col" className="px-3 py-2 text-left">Destination</th>
              <th scope="col" className="px-3 py-2 text-left">Departure Port</th>
              <th scope="col" className="px-3 py-2 text-left">Description</th>
              <th scope="col" className="px-3 py-2 text-left">Tiers</th>
              <th scope="col" className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cruises.map((cruise) => (
              <tr key={cruise.id} className="border-b border-b/30">
                <td className="px-3 py-2">{cruise.id}</td>
                <td className="px-3 py-2">{cruise.cruise_name}</td>
                <td className="px-3 py-2">{cruise.cruise_destination}</td>
                <td className="px-3 py-2">{cruise.cruise_port}</td>
                <td className="px-3 py-2">{cruise.cruise_description}</td>
                <td className="px-3 py-2">
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
                <td className="space-x-2 px-3 py-2">
                  <button
                    type="button"
                    className="blue"
                    onClick={() => setEditingCruise(cruise)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="pink"
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
    </section>
  );
}