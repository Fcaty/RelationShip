import { useState } from 'react';
import { db } from '../../services/firebase'; // Adjust relative path as needed
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export default function AddTagForm() {
  const [tagName, setTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setLoading(true);
    setStatusMsg('');

    try {
      // 1. Get count of existing tags to auto-increment ID
      const querySnapshot = await getDocs(collection(db, 'tags'));
      const nextIndex = querySnapshot.size + 1;
      const customId = `TAG-${String(nextIndex).padStart(3, '0')}`; // e.g. TAG-001

      // 2. Save tag document to Firestore
      await setDoc(doc(db, 'tags', customId), {
        tag_name: tagName.trim(),
        created_at: new Date().toISOString(),
      });

      setStatusMsg(`Tag created! ID: ${customId}`);
      setTagName('');
    } catch (error) {
      console.error('Error adding tag:', error);
      setStatusMsg('Failed to create tag.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Add New Tag</h2>

      {statusMsg && <p>{statusMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="tag_name">Tag Name</label>
          <input
            id="tag_name"
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            placeholder="e.g. Tropical, Family-Friendly, Adventure"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Tag'}
        </button>
      </form>
    </div>
  );
}