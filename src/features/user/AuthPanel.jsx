import { useState } from 'react';
import LoginForm from '../forms/LoginForm';
import RegisterForm from '../forms/RegisterForm';

export default function AuthPanel() {
  const [mode, setMode] = useState('login');
  return (
    <div>
      {mode === 'login' ? <LoginForm /> : <RegisterForm />}
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'No account? Register' : 'Have an account? Sign In'}
      </button>
    </div>
  );
}

