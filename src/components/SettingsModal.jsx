import { RiCloseLine } from 'react-icons/ri';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function SettingsModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const { changePassword, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setIsError(true);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsError(true);
      return;
    }

    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setMessage(result.message);
      setIsError(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setMessage(result.message);
      setIsError(true);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
    setIsError(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Change Password</h3>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrentPassword ? <RiEyeLine className="w-5 h-5" /> : <RiEyeOffLine className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showNewPassword ? <RiEyeLine className="w-5 h-5" /> : <RiEyeOffLine className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <RiEyeLine className="w-5 h-5" /> : <RiEyeOffLine className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <p className={`text-center text-sm font-bold mt-4 ${isError ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsModal;
