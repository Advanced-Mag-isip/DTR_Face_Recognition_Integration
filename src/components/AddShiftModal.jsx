import { RiCloseLine } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import { checkHoliday } from '../utils/holidayApi';

function AddShiftModal({ isOpen, onClose, onSave, editingshift, zIndex = 50, employeeId }) {
  const [includeOvertime, setIncludeOvertime] = useState(false);
  const [enableMorning, setEnableMorning] = useState(true);
  const [enableAfternoon, setEnableAfternoon] = useState(true);
  const [holidayInfo, setHolidayInfo] = useState(null);
  const [checkingHoliday, setCheckingHoliday] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    morningIn: '',
    morningOut: '',
    afternoonIn: '',
    afternoonOut: '',
    overtimeStart: '',
    overtimeEnd: '',
    notes: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingshift) {
      const hasMorning = !!(editingshift.morningTimeIn || editingshift.morningTimeOut);
      const hasAfternoon = !!(editingshift.afternoonTimeIn || editingshift.afternoonTimeOut);

      setFormData({
        date: editingshift.date ? new Date(editingshift.date).toISOString().split('T')[0] : '',
        morningIn: editingshift.morningTimeIn || '',
        morningOut: editingshift.morningTimeOut || '',
        afternoonIn: editingshift.afternoonTimeIn || '',
        afternoonOut: editingshift.afternoonTimeOut || '',
        overtimeStart: editingshift.overtimeTimeIn || '',
        overtimeEnd: editingshift.overtimeTimeOut || '',
        notes: editingshift.notes || '',
      });
      setEnableMorning(hasMorning);
      setEnableAfternoon(hasAfternoon);
      setIncludeOvertime(!!editingshift.overtimeTimeIn);
      
      // Set holiday info if available
      if (editingshift.isHoliday) {
        setHolidayInfo({
          isHoliday: true,
          name: editingshift.holidayName,
          type: editingshift.holidayType,
          displayName: getHolidayDisplayName(editingshift.holidayType)
        });
      } else {
        setHolidayInfo(null);
      }
    } else {
      setFormData({
        date: '',
        morningIn: '',
        morningOut: '',
        afternoonIn: '',
        afternoonOut: '',
        overtimeStart: '',
        overtimeEnd: '',
        notes: '',
      });
      setEnableMorning(true);
      setEnableAfternoon(true);
      setIncludeOvertime(false);
      setHolidayInfo(null);
    }
  }, [editingshift]);

  const getHolidayDisplayName = (type) => {
    switch (type) {
      case 'regular': return 'Regular Holiday';
      case 'special_non_working': return 'Special Non-Working Holiday';
      case 'special_working': return 'Special Working Holiday';
      default: return null;
    }
  };

  // Check if selected date is a holiday
  useEffect(() => {
    const checkDateHoliday = async () => {
      if (!formData.date) {
        setHolidayInfo(null);
        return;
      }
      
      setCheckingHoliday(true);
      try {
        const info = await checkHoliday(formData.date);
        setHolidayInfo(info);
      } catch (err) {
        console.error('Error checking holiday:', err);
        setHolidayInfo(null);
      } finally {
        setCheckingHoliday(false);
      }
    };

    checkDateHoliday();
  }, [formData.date]);

  const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return '0.0';

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const diffMinutes = endMinutes - startMinutes;
    const hours = diffMinutes / 60;

    return hours.toFixed(2);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const shiftData = {
      date: formData.date,
      morningIn: enableMorning ? formData.morningIn : null,
      morningOut: enableMorning ? formData.morningOut : null,
      afternoonIn: enableAfternoon ? formData.afternoonIn : null,
      afternoonOut: enableAfternoon ? formData.afternoonOut : null,
      overtimeStart: includeOvertime ? formData.overtimeStart : null,
      overtimeEnd: includeOvertime ? formData.overtimeEnd : null,
      notes: formData.notes,
    };

    // Validate that at least one shift period is filled
    if (!enableMorning && !enableAfternoon) {
      setError('Please select at least Morning or Afternoon shift');
      return;
    }

    if (enableMorning && (!formData.morningIn || !formData.morningOut)) {
      setError('Please fill both Morning Time In and Out');
      return;
    }

    if (enableAfternoon && (!formData.afternoonIn || !formData.afternoonOut)) {
      setError('Please fill both Afternoon Time In and Out');
      return;
    }

    // Include employeeId if provided (for admin creating shifts for employees)
    if (employeeId) {
      shiftData.employeeId = Number(employeeId);
      
    }

    
    onSave(shiftData, (errorMsg) => setError(errorMsg));
  };

  const handleClose = () => {
    setFormData({
      date: '',
      morningIn: '',
      morningOut: '',
      afternoonIn: '',
      afternoonOut: '',
      overtimeStart: '',
      overtimeEnd: '',
      notes: '',
    });
    setEnableMorning(true);
    setEnableAfternoon(true);
    setIncludeOvertime(false);
    setError('');
    onClose();
  };

  const handleQuickFill = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      date: today,
      morningIn: '09:00',
      morningOut: '12:00',
      afternoonIn: '13:00',
      afternoonOut: '18:00',
    }));
  };

  const morningHours = calculateHours(formData.morningIn, formData.morningOut);
  const afternoonHours = calculateHours(formData.afternoonIn, formData.afternoonOut);
  const overtimeHours = calculateHours(formData.overtimeStart, formData.overtimeEnd);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{editingshift ? 'Edit Shift Details' : 'Add Shift Details'}</h3>
            {!editingshift && (
              <p className="text-xs text-slate-500 mt-1">Quick fill: Morning 9AM-12PM, Afternoon 1PM-6PM</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editingshift && (
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/20 transition"
              >
                ⚡ Quick Fill
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RiCloseLine className="w-6 h-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Date */}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {checkingHoliday && (
                <span className="text-xs text-slate-400">Checking holiday...</span>
              )}
              {holidayInfo && holidayInfo.isHoliday && (
                <div className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                  holidayInfo.type === 'regular' ? 'bg-red-50 text-red-700 border-red-200' :
                  holidayInfo.type === 'special_non_working' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  🎄 {holidayInfo.name} - {holidayInfo.displayName}
                  {holidayInfo.type === 'regular' && ' (2x pay)'}
                  {holidayInfo.type === 'special_non_working' && ' (1.3x pay)'}
                  {holidayInfo.type === 'special_working' && ' (normal pay)'}
                </div>
              )}
              {formData.date && !checkingHoliday && !holidayInfo?.isHoliday && (
                <span className="text-xs text-slate-400">Regular working day</span>
              )}
            </div>

            {/* Morning Shift Toggle */}
            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="enableMorning"
                checked={enableMorning}
                onChange={(e) => {
                  setEnableMorning(e.target.checked);
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, morningIn: '', morningOut: '' }));
                  }
                }}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="enableMorning" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Morning Shift
              </label>
            </div>

            {/* Morning Time In */}
            {enableMorning && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Morning Time In</label>
                  <input
                    type="time"
                    name="morningIn"
                    value={formData.morningIn}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Morning Time Out */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Morning Time Out</label>
                  <input
                    type="time"
                    name="morningOut"
                    value={formData.morningOut}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Morning Duration */}
                {formData.morningIn && formData.morningOut && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-500">Duration: {morningHours} hrs</span>
                  </div>
                )}
              </>
            )}

            {/* Afternoon Shift Toggle */}
            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="enableAfternoon"
                checked={enableAfternoon}
                onChange={(e) => {
                  setEnableAfternoon(e.target.checked);
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, afternoonIn: '', afternoonOut: '' }));
                  }
                }}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="enableAfternoon" className="text-sm font-semibold text-slate-700 cursor-pointer">
                Afternoon Shift
              </label>
            </div>

            {/* Afternoon Time In */}
            {enableAfternoon && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Afternoon Time In</label>
                  <input
                    type="time"
                    name="afternoonIn"
                    value={formData.afternoonIn}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Afternoon Time Out */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Afternoon Time Out</label>
                  <input
                    type="time"
                    name="afternoonOut"
                    value={formData.afternoonOut}
                    onChange={handleInputChange}
                    required
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Afternoon Duration */}
                {formData.afternoonIn && formData.afternoonOut && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-500">Duration: {afternoonHours} hrs</span>
                  </div>
                )}
              </>
            )}

            {/* Overtime Start */}
            {includeOvertime && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Overtime Start</label>
                  <input
                    type="time"
                    name="overtimeStart"
                    value={formData.overtimeStart}
                    onChange={handleInputChange}
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Overtime End */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Overtime End</label>
                  <input
                    type="time"
                    name="overtimeEnd"
                    value={formData.overtimeEnd}
                    onChange={handleInputChange}
                    className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Overtime Duration */}
                {formData.overtimeStart && formData.overtimeEnd && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-500">Duration: {overtimeHours} hrs</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Overtime Checkbox */}
          <div className="flex items-center gap-2 mb-6">
            <input
              type="checkbox"
              id="includeOvertime"
              checked={includeOvertime}
              onChange={(e) => setIncludeOvertime(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="includeOvertime" className="text-sm font-semibold text-slate-700 cursor-pointer">
              Include Overtime
            </label>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2 mb-6">
            <label className="text-sm font-semibold text-slate-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Add any notes about this shift..."
              className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
            >
              {editingshift ? 'Update Shift' : 'Save Shift'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddShiftModal;
