import { X } from 'lucide-react';

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[24px] bg-surface border border-border shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-reem text-xl text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-elevated hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel, danger, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[24px] bg-surface border border-border shadow-2xl p-6">
        <h2 className="font-reem text-xl text-text-primary mb-3">{title}</h2>
        <p className="font-plein text-sm text-text-secondary leading-6 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full bg-elevated px-5 py-2.5 font-plein-medium text-sm text-text-secondary hover:bg-elevated/70 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-full px-5 py-2.5 font-plein-medium text-sm transition-colors ${
              danger
                ? 'bg-danger text-wisteria-50 hover:bg-danger/90'
                : 'bg-wisteria-300 text-wisteria-950 hover:bg-wisteria-200'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}