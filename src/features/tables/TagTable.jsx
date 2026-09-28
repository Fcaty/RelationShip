import { useState, useEffect } from 'react';
import { db } from '../../services/firebase'; // Adjust relative path as needed
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function TagTable() {
  const [tags, setTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null); // Holds the tag currently being edited
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Real-time listener for tags collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'tags'),
      (snapshot) => {
        const tagList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTags(tagList);
      },
      (error) => {
        console.error('Error fetching tags:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle Edit button click
  const handleEditClick = (tag) => {
    setEditingTag(tag);
    setEditName(tag.tag_name || tag.name || '');
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditName('');
  };

  // Save updated tag to Firestore
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setLoading(true);
    setStatusMsg('');

    try {
      await setDoc(
        doc(db, 'tags', editingTag.id),
        {
          tag_name: editName.trim(),
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      setStatusMsg(`Tag ${editingTag.id} updated successfully.`);
      setEditingTag(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating tag:', error);
      setStatusMsg('Failed to update tag.');
    } finally {
      setLoading(false);
    }
  };

  // Delete tag from Firestore
  const handleDeleteClick = async (id) => {
    if (!window.confirm(`Are you sure you want to delete tag ${id}?`)) return;

    setLoading(true);
    setStatusMsg('');

    try {
      await deleteDoc(doc(db, 'tags', id));
      setStatusMsg(`Tag ${id} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting tag:', error);
      setStatusMsg('Failed to delete tag.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Manage Tags</h2>

      {statusMsg && <p>{statusMsg}</p>}

      {/* Edit Form Drawer / Fieldset */}
      {editingTag && (
        <fieldset>
          <legend>Editing Tag: {editingTag.id}</legend>
          <form onSubmit={handleSaveUpdate}>
            <div>
              <label htmlFor="edit_tag_name">Tag Name</label>
              <input
                id="edit_tag_name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Update Tag'}
            </button>
            <button type="button" onClick={handleCancelEdit} disabled={loading}>
              Cancel
            </button>
          </form>
        </fieldset>
      )}

      {tags.length === 0 ? (
        <p>No tags found in the database.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tag Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td>{tag.id}</td>
                <td>{tag.tag_name || tag.name}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleEditClick(tag)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(tag.id)}
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