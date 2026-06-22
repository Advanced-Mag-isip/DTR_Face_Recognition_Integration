import { useState, useRef } from 'react';
import axios from 'axios';
import { LocalJsLivenessFlow } from './liveness/LocalJsLivenessFlow';
import { RiTimeLine } from 'react-icons/ri';
import { FaCamera } from 'react-icons/fa';  // Import camera icon
import { useNavigate } from 'react-router-dom';

function KioskMode() {
  const navigate = useNavigate();

  const [showLiveness, setShowLiveness] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const transactionStartTimeRef = useRef(null);

  const triggerKioskScan = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    transactionStartTimeRef.current = performance.now();
    setErrorMessage(null);
    setStatusMessage(null);
    setShowLiveness(true);
  };

  const handleKioskLivenessPassed = async ({ selfieDataUrl }) => {
    setShowLiveness(false);

    try {
      const res = await axios.post('/api/shifts/kiosk-clock', {
        liveImage: selfieDataUrl,
      });

      if (res.data.success) {
        if (transactionStartTimeRef.current) {
          const duration = (performance.now() - transactionStartTimeRef.current).toFixed(0);
          console.log(`%c[PERF] Kiosk transaction completed in ${duration}ms`, "color: #10b981; font-weight: bold;");
        }
        setStatusMessage(`Good day, ${res.data.employeeName}! ${res.data.message}`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.error || 'Identity verification failed. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLivenessFailed = () => {
    setShowLiveness(false);
    setIsProcessing(false);
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
          <p className="text-sm text-slate-500 mt-1">Tap to record your attendance via face scan</p>
        </div>

        {/* SINGLE BUTTON - OVAL WITH CAMERA ICON */}
        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={triggerKioskScan}
            disabled={isProcessing}
            className={`
              w-48 h-48 
              rounded-full 
              ${isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'} 
              text-white font-bold text-base tracking-wide 
              shadow-lg hover:shadow-xl transition-all duration-200 
              flex flex-col items-center justify-center gap-2
              border-4 border-white
              mx-auto
            `}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Processing...</span>
              </>
            ) : (
              <>
                {/* Camera Icon */}
                <FaCamera className="w-12 h-12" />
                <span>Scan Face</span>
              </>
            )}
          </button>
          
          <p className="text-xs text-slate-400 mt-2">
            {isProcessing ? 'Please wait...' : 'Click the button to scan your face'}
          </p>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            Go to Login
          </button>
        </div>

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
          onFailed={handleLivenessFailed}
        />
      )}
    </div>
  );
}

export default KioskMode;