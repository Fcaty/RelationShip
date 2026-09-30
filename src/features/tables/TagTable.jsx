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
    <section aria-labelledby="manage-tags-heading">
      <h2 id="manage-tags-heading" className="text-n">Manage Tags</h2>

      {statusMsg && <p role="status" className="font-moderustic text-n">{statusMsg}</p>}

      {/* Render TagForm counterpart when editing a row */}
      {editingTag && (
        <fieldset className="mb-5">
          <legend>Edit Tag Counterpart</legend>
          <TagForm
            initialData={editingTag}
            onSuccess={() => {
              setEditingTag(null);
              setStatusMsg(`Tag ${editingTag.id} updated successfully.`);
            }}
          />
          <button type="button" className="pink mt-3" onClick={handleCancelEdit}>
            Cancel Edit
          </button>
        </fieldset>
      )}

      {tags.length === 0 ? (
        <p>No tags found in the database.</p>
      ) : (
        <table className="w-full border-collapse text-left font-moderustic text-n">
          <caption className="sr-only">Tag inventory</caption>
          <thead className="bg-n text-w">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">ID</th>
              <th scope="col" className="px-3 py-2 text-left">Tag Name</th>
              <th scope="col" className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-b border-b/30">
                <td className="px-3 py-2">{tag.id}</td>
                <td className="px-3 py-2">{tag.tag_name || tag.name}</td>
                <td className="space-x-2 px-3 py-2">
                  <button
                    type="button"
                    className="blue"
                    onClick={() => handleEditClick(tag)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="pink"
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
    </section>
  );
}