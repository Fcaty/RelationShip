import { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');

    // 1. Password validation
    if (formData.password !== formData.confirmPassword) {
      setStatusMsg('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setStatusMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // 2. Create Auth user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 3. Save profile to Firestore with hardcoded 'customer' role
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'customer', // Default role for all public sign-ups
        created_at: new Date().toISOString(),
      });

      setStatusMsg('Account created successfully!');
      setFormData({ email: '', password: '', confirmPassword: '' });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setStatusMsg('This email is already registered.');
      } else {
        setStatusMsg('Failed to register: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Account</h2>

      {statusMsg && <p>{statusMsg}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reg_email">Email Address</label>
          <input
            id="reg_email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="user@example.com"
            required
          />
        </div>

        <div>
          <label htmlFor="reg_password">Password</label>
          <input
            id="reg_password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label htmlFor="reg_confirm_password">Confirm Password</label>
          <input
            id="reg_confirm_password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
    </div>
  );
}