import { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginForm({ onSuccess }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg('');

    try {
      // 1. Authenticate user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const user = userCredential.user;

      // 2. Fetch user profile from Firestore to retrieve their role
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userRole = 'customer';
      if (userDocSnap.exists()) {
        userRole = userDocSnap.data().role || 'customer';
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        role: userRole,
      };

      setStatusMsg(`Success! Logged in as ${userRole}.`);
      setCredentials({ email: '', password: '' });

      // Pass user payload to parent handler (e.g., to redirect or update state)
      if (onSuccess) {
        onSuccess(userData);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        setStatusMsg('Invalid email or password.');
      } else {
        setStatusMsg('Login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Sign In</h3>

      {statusMsg && <p>{statusMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login_email">Email Address</label>
          <input
            id="login_email"
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            placeholder="user@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="login_password">Password</label>
          <input
            id="login_password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Authenticating...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}