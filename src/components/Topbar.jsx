import { RiTimeLine } from 'react-icons/ri';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { RiSettings4Line } from 'react-icons/ri';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SettingsModal from './SettingsModal';

function Topbar() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl shadow-sm">
              <RiTimeLine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">DTR Tracker</h1>
              <p className="text-xs text-slate-500">Daily Time Record System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Hi, <strong className="text-slate-800">{user?.firstName}</strong></span>
            <button
              className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
              onClick={() => setShowSettings(true)}
            >
              <RiSettings4Line className="w-5 h-5" />
              Settings
            </button>
            <button
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
              onClick={() => setShowConfirm(true)}
            >
              <RiLogoutBoxLine className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Popup */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-slate-800">Confirm Logout</h2>
              <p className="text-sm text-slate-500">Are you sure you want to log out of your account?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-light transition"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

export default Topbar;
