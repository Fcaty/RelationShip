import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export default function TagForm({ initialData = null, onSuccess = null }) {
  const isEditMode = Boolean(initialData);

  const [tagName, setTagName] = useState(
    initialData?.tag_name || initialData?.name || ''
  );
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Sync state when initialData changes (e.g., selecting a different tag to edit)
  useEffect(() => {
    if (initialData) {
      setTagName(initialData.tag_name || initialData.name || '');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setLoading(true);
    setStatusMsg('');

    try {
      let targetDocId = initialData?.id;

      // Auto-generate sequential ID like TAG-001 if creating a new tag
      if (!isEditMode) {
        const querySnapshot = await getDocs(collection(db, 'tags'));
        const nextIndex = querySnapshot.size + 1;
        targetDocId = `TAG-${String(nextIndex).padStart(3, '0')}`;
      }

      await setDoc(
        doc(db, 'tags', targetDocId),
        {
          tag_name: tagName.trim(),
          updated_at: new Date().toISOString(),
          ...(isEditMode ? {} : { created_at: new Date().toISOString() }),
        },
        { merge: true }
      );

      setStatusMsg(`Tag ${isEditMode ? 'updated' : 'created'}! ID: ${targetDocId}`);

      if (!isEditMode) {
        setTagName('');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving tag:', error);
      setStatusMsg('Failed to save tag.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{isEditMode ? `Edit Tag (${initialData.id})` : 'Add New Tag'}</h2>

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
          {loading ? 'Saving...' : isEditMode ? 'Update Tag' : 'Add Tag'}
        </button>
      </form>
    </div>
  );
}