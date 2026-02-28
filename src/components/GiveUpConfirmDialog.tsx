import { useEffect, useRef } from 'react';

interface GiveUpConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GiveUpConfirmDialog({ open, onConfirm, onCancel }: GiveUpConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Trap focus and handle ESC key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  // Focus the dialog when opened
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="giveup-dialog-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="mx-4 flex max-w-[320px] flex-col items-center gap-5 rounded-3xl bg-white px-8 py-10 shadow-2xl animate-pop"
      >
        <span className="text-5xl" aria-hidden="true">🤔</span>
        <p id="giveup-dialog-title" className="text-center text-xl font-bold text-slate-700">
          こたえを みても いいかな?
        </p>
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-emerald-400 text-base font-bold text-white transition-transform duration-100 active:scale-[0.92]"
          >
            まだ がんばる
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-12 flex-1 items-center justify-center rounded-xl bg-violet-100 text-base font-bold text-violet-600 transition-transform duration-100 active:scale-[0.92]"
          >
            こたえを みる
          </button>
        </div>
      </div>
    </div>
  );
}
