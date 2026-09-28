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
    <div>
      <h2>Manage Users</h2>

      {statusMsg && <p>{statusMsg}</p>}

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

            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Update User'}
            </button>
            <button type="button" onClick={handleCancelEdit} disabled={loading}>
              Cancel
            </button>
          </form>
        </fieldset>
      )}

      {/* Users Table */}
      {users.length === 0 ? (
        <p>No users found in the database.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>UID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username || '—'}</td>
                <td>{u.email}</td>
                <td>
                  <strong>{u.role || 'customer'}</strong>
                </td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleEditClick(u)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
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
    </div>
  );
}