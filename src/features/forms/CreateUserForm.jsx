import { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Initialize a secondary Firebase app instance specifically for creating users without switching current session
const secondaryApp = initializeApp(
  {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  },
  'SecondaryAuth' // Distinct instance name
);

const secondaryAuth = getAuth(secondaryApp);

export default function AdminCreateUserForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdminCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    try {
      // 1. Create user in Secondary Auth (doesn't log out current admin)
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        formData.password
      );
      const newUid = userCredential.user.uid;

      // 2. Immediately sign out the new user from secondary instance
      await signOut(secondaryAuth);

      // 3. Create the user document in Firestore using main db reference
      await setDoc(doc(db, 'users', newUid), {
        email: formData.email,
        role: formData.role,
        created_at: new Date().toISOString(),
      });

      setStatusMsg(`User ${formData.email} successfully created!`);
      setFormData({ email: '', password: '', role: 'customer' });
    } catch (error) {
      console.error('Error creating user as admin:', error);
      setStatusMsg('Failed to create user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <fieldset>
      <legend>Add New User (Admin)</legend>
      {statusMsg && <p role="status" className="font-moderustic text-n">{statusMsg}</p>}
      <form onSubmit={handleAdminCreateUser}>
        <div>
          <label htmlFor="admin_user_email">Email</label>
          <input
            id="admin_user_email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="admin_user_password">Temporary Password</label>
          <input
            id="admin_user_password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="admin_user_role">Role</label>
          <select
            id="admin_user_role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="green" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </fieldset>
  );
}