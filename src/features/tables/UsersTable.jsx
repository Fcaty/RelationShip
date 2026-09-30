import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function UserTable() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('customer');
  const [editUsername, setEditUsername] = useState('');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Real-time listener for users collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id, // Auth UID
          ...doc.data(),
        }));
        setUsers(userList);
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Start Editing User
  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditRole(user.role || 'customer');
    setEditUsername(user.username || '');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditRole('customer');
    setEditUsername('');
  };

  // Save Role and Username Updates to Firestore
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    try {
      await setDoc(
        doc(db, 'users', editingUser.id),
        {
          role: editRole,
          username: editUsername.trim(),
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      setStatusMsg(`User ${editingUser.email} updated successfully.`);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      setStatusMsg('Failed to update user role.');
    } finally {
      setLoading(false);
    }
  };

  // Delete User Document from Firestore
  const handleDeleteClick = async (user) => {
    if (!window.confirm(`Are you sure you want to remove user record for ${user.email}?`)) return;

    setLoading(true);
    setStatusMsg('');

    try {
      await deleteDoc(doc(db, 'users', user.id));
      setStatusMsg(`User record ${user.email} removed from Firestore.`);
    } catch (error) {
      console.error('Error deleting user record:', error);
      setStatusMsg('Failed to delete user record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="manage-users-heading">
      <h2 id="manage-users-heading" className="text-n">Manage Users</h2>

      {statusMsg && <p role="status" className="font-moderustic text-n">{statusMsg}</p>}

      {/* Edit User Panel */}
      {editingUser && (
        <fieldset>
          <legend>Editing User: {editingUser.email}</legend>
          <form onSubmit={handleSaveUpdate}>
            <div>
              <label htmlFor="edit_username">Username</label>
              <input
                id="edit_username"
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Username"
              />
            </div>

            <div>
              <label htmlFor="edit_role">User Role</label>
              <select
                id="edit_role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" className="green" disabled={loading}>
              {loading ? 'Saving...' : 'Update User'}
            </button>
            <button type="button" className="pink" onClick={handleCancelEdit} disabled={loading}>
              Cancel
            </button>
          </form>
        </fieldset>
      )}

      {/* Users Table */}
      {users.length === 0 ? (
        <p>No users found in the database.</p>
      ) : (
        <table className="w-full border-collapse text-left font-moderustic text-n">
          <caption className="sr-only">User records</caption>
          <thead className="bg-n text-w">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">UID</th>
              <th scope="col" className="px-3 py-2 text-left">Username</th>
              <th scope="col" className="px-3 py-2 text-left">Email</th>
              <th scope="col" className="px-3 py-2 text-left">Role</th>
              <th scope="col" className="px-3 py-2 text-left">Created At</th>
              <th scope="col" className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-b/30">
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.username || '—'}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <strong>{u.role || 'customer'}</strong>
                </td>
                <td className="px-3 py-2">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                <td className="space-x-2 px-3 py-2">
                  <button
                    type="button"
                    className="blue"
                    onClick={() => handleEditClick(u)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="pink"
                    onClick={() => handleDeleteClick(u)}
                    disabled={loading}
                  >
                    Delete Record
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