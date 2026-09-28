import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import TagForm from '../forms/TagForm'; // Import the TagForm component

export default function TagTable() {
  const [tags, setTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null); // Holds the tag currently being edited
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
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingTag(null);
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

      {/* Render TagForm counterpart when editing a row */}
      {editingTag && (
        <fieldset style={{ marginBottom: '20px' }}>
          <legend>Edit Tag Counterpart</legend>
          <TagForm
            initialData={editingTag}
            onSuccess={() => {
              setEditingTag(null);
              setStatusMsg(`Tag ${editingTag.id} updated successfully.`);
            }}
          />
          <button type="button" onClick={handleCancelEdit} style={{ marginTop: '10px' }}>
            Cancel Edit
          </button>
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