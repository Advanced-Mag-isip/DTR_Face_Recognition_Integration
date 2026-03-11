import { RiCloseLine } from 'react-icons/ri';

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, shiftDate }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Confirm Delete</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete the shift for{' '}
            <span className="font-semibold text-slate-800">
              {shiftDate ? new Date(shiftDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'this date'}
            </span>
            ?
          </p>
          <p className="text-sm text-slate-500">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;
