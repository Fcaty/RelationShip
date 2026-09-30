import { useEffect, useRef } from 'react';

export default function FloatingMessagePopup({ title, message, type = 'success', onClose }) {
  const isError = type === 'error';
  const accentClass = isError ? 'text-p outline-p/50' : 'text-g outline-g/50';
  const popupRef = useRef(null);

  useEffect(() => {
    if (!onClose) return undefined;

    const handleOutsidePointerDown = (event) => {
      if (!popupRef.current?.contains(event.target)) onClose();
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [onClose]);

  return (
    <section
      ref={popupRef}
      className={`fixed left-4 top-4 z-60 w-96 max-w-[calc(100vw-2rem)] self-stretch p-2.5 bg-w rounded-[10px] outline-2 -outline-offset-2 inline-flex flex-col justify-center items-start gap-2.5 overflow-hidden shadow-lg ${accentClass}`}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
    >
      <div className="self-stretch inline-flex justify-start items-center gap-2.5">
        <strong className="flex-1 justify-center text-2xl font-medium font-moderustic">{title}</strong>
      </div>
      <div className="justify-center text-xl font-medium font-moderustic">{message}</div>
    </section>
  );
}