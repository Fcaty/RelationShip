import { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import FloatingMessagePopup from '../../components/FloatingMessagePopup';

export default function RegisterForm({ onSuccess, onLoadingChange }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    // 1. Password validation
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    if (formData.password.length < 6) {
      setStatus({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    onLoadingChange?.(true);

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
        role: 'customer',
        created_at: new Date().toISOString(),
      });

      setStatus({ type: 'success', message: 'Account created successfully!' });
      setFormData({ email: '', password: '', confirmPassword: '' });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setStatus({ type: 'error', message: 'This email is already registered.' });
      } else {
        setStatus({ type: 'error', message: 'Failed to register: ' + error.message });
      }
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <form id="auth-register-form" className="self-stretch py-5 flex flex-col justify-start items-center gap-2.5" onSubmit={handleSubmit} noValidate>
      <h2 id="register-title" className="self-stretch text-center text-w text-3xl font-semibold font-moderustic">Sign Up</h2>

      {status && (
        <FloatingMessagePopup
          title={status.type === 'error' ? 'Registration Error' : 'Registration Successful'}
          message={status.message}
          type={status.type}
          onClose={() => setStatus(null)}
        />
      )}

      <label htmlFor="reg_email" className="w-full">
        <input
          id="reg_email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email Address"
          required
        />
      </label>

      <label htmlFor="reg_password" className="w-full">
        <input
          id="reg_password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          required
        />
      </label>

      <label htmlFor="reg_confirm_password" className="w-full">
        <input
          id="reg_confirm_password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm Password"
          required
        />
      </label>
    </form>
  );
}