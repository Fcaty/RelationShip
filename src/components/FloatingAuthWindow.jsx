export default function FloatingAuthWindow({ children, mode, onModeChange, onClose, isSubmitting = false }) {
  const isLogin = mode === 'login';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-n/20 backdrop-blur-sm" onClick={onClose}>
      <section
        className="size-125 px-12 py-2.5 bg-linear-to-b from-b from-11% via-g/50 to-w/50 rounded-3xl shadow-[-4px_4px_1px_0px_rgba(234,82,111,0.50)] outline-10 -outline-offset-10 outline-w/50 inline-flex flex-col justify-center items-center gap-2.5 overflow-hidden"
        aria-live="polite"
        aria-modal="true"
        aria-labelledby={isLogin ? 'login-title' : 'register-title'}
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="py-2.5 flex flex-col justify-center items-center gap-1.25" aria-label="Relationship brand header">
          <div className="inline-flex justify-start items-center gap-2.5">
            <div className="w-10 self-stretch bg-w" aria-hidden="true" />
            <span className="justify-center text-w text-3xl font-normal font-aclonica">RelationShip</span>
          </div>
        </header>

        {children}

        <div className="inline-flex items-start gap-2.5" role="group" aria-label="Authentication actions">
          {isLogin && (
            <button
              type="button"
              className="blue p-2.5 rounded-2xl outline-2 -outline-offset-2 outline-w"
              onClick={() => onModeChange('register')}
              disabled={isSubmitting}
            >
              Sign Up
            </button>
          )}
          <button
            type="submit"
            form={isLogin ? 'auth-login-form' : 'auth-register-form'}
            className={isLogin ? 'blue p-2.5 rounded-2xl outline-2 -outline-offset-2 outline-w' : 'green p-2.5 rounded-2xl'}
            disabled={isSubmitting}
          >
            {isSubmitting ? (isLogin ? 'Logging In...' : 'Signing Up...') : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </div>
      </section>
    </div>
  );
}
