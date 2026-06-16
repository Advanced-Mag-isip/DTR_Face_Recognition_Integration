import { useState } from 'react';
import axios from 'axios';
import { LocalJsLivenessFlow } from './liveness/LocalJsLivenessFlow';
import { RiTimeLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

function KioskMode() {
  const navigate = useNavigate();

  const [showLiveness, setShowLiveness] = useState(false);
  const [livenessAction, setLivenessAction] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const triggerKioskScan = (actionType) => {
    setLivenessAction(actionType);
    setErrorMessage(null);
    setStatusMessage(null);
    setShowLiveness(true);
  };

  const handleKioskLivenessPassed = async ({ selfieDataUrl }) => {
    setShowLiveness(false);

    try {
      const res = await axios.post('/api/shifts/kiosk-clock', {
        liveImage: selfieDataUrl,
        livenessAction: livenessAction
      });

      if (res.data.success) {
        setStatusMessage(`Good day, ${res.data.employeeName}! ${res.data.message}`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Identity verification failed. Try again.');
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="flex flex-col bg-white p-10 shadow-xl rounded-3xl gap-8 w-full max-w-md border border-slate-200">
        
        <div className="flex items-center gap-3">
          <div className="bg-primary p-3 rounded-2xl shadow-sm">
            <RiTimeLine className="w-8 h-8 text-white"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">DTR Tracker</h1>
            <p className="text-sm text-slate-500">Daily Time Record System</p>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-slate-800">Attendance Kiosk</h2>
          <p className="text-sm text-slate-500 mt-1">Select an option to record your shift via face scan</p>
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => triggerKioskScan('in')}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-4 rounded-xl text-base tracking-wide shadow-sm transition-all flex items-center justify-center gap-2"
          >
            Time In
          </button>
          
          {/* 🛠️ CHANGED: Set background states to red (bg-red-600 / hover:bg-red-700 / active:bg-red-800) */}
          <button 
            onClick={() => triggerKioskScan('out')}
            className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-4 rounded-xl text-base tracking-wide shadow-sm transition-all flex items-center justify-center gap-2"
          >
            Time Out
          </button>
        </div>

        {/* 🛠️ CHANGED: Text adjusted to blue (text-blue-600 / hover:text-blue-800) */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            Go to Login
          </button>
        </div>

        {/* Standardized Response Messages matching original form errors */}
        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium text-center leading-relaxed">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium text-center">
            {errorMessage}
          </div>
        )}
      </div>

      {showLiveness && (
        <LocalJsLivenessFlow
          onPassed={handleKioskLivenessPassed}
          onFailed={() => setShowLiveness(false)}
        />
      )}
    </div>
  );
}

export default KioskMode;