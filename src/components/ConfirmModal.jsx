function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmClassName = 'bg-red-500 hover:bg-red-600',
  disabled = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500" dangerouslySetInnerHTML={{ __html: message }} />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 ${confirmClassName}`}
          >
            {disabled ? 'Loading...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
