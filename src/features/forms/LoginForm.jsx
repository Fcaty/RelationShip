import { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import FloatingMessagePopup from '../../components/FloatingMessagePopup';

export default function LoginForm({ onSuccess, onLoadingChange }) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const [status, setStatus] = useState(null);

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onLoadingChange?.(true);
    setStatus(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const user = userCredential.user;

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

      setStatus({ type: 'success', message: `Success! Logged in as ${userRole}.` });
      setCredentials({ email: '', password: '' });

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
        setStatus({ type: 'error', message: 'Invalid email or password.' });
      } else {
        setStatus({ type: 'error', message: 'Login failed: ' + error.message });
      }
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <form id="auth-login-form" className="self-stretch py-5 flex flex-col justify-start items-center gap-2.5" onSubmit={handleSubmit} noValidate>
      <h2 id="login-title" className="self-stretch text-center text-w text-3xl font-semibold font-moderustic">Login</h2>

      {status && (
        <FloatingMessagePopup
          title={status.type === 'error' ? 'Login Error' : 'Login Successful'}
          message={status.message}
          type={status.type}
          onClose={() => setStatus(null)}
        />
      )}

      <label htmlFor="login_email" className="w-full">
        <input
          id="login_email"
          type="email"
          name="email"
          value={credentials.email}
          onChange={handleInputChange}
          placeholder="Email Address"
          required
        />
      </label>

      <label htmlFor="login_password" className="w-full">
        <input
          id="login_password"
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleInputChange}
          placeholder="Password"
          required
        />
      </label>
    </form>
  );
}