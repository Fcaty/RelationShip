import { useState } from 'react';
import FloatingAuthWindow from '../../components/FloatingAuthWindow';
import LoginForm from '../forms/LoginForm';
import RegisterForm from '../forms/RegisterForm';

export default function AuthPanel() {
  const [mode, setMode] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <FloatingAuthWindow mode={mode} onModeChange={setMode} isSubmitting={isSubmitting}>
      {mode === 'login'
        ? <LoginForm onLoadingChange={setIsSubmitting} />
        : <RegisterForm onLoadingChange={setIsSubmitting} onSuccess={() => setMode('login')} />}
    </FloatingAuthWindow>
  );
}

