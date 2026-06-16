import { useState } from 'react';
import { RiEditLine } from 'react-icons/ri';
import { RiDeleteBinLine } from 'react-icons/ri';
import { RiCloseLine } from 'react-icons/ri';

const HOLIDAY_MULTIPLIERS = {
  regular: 2.0,
  special_non_working: 1.3,
  special_working: 1.0
};

const getHolidayDisplayName = (type) => {
  switch (type) {
    case 'regular': return 'Regular Holiday';
    case 'special_non_working': return 'Special Non-Working';
    case 'special_working': return 'Special Working';
    default: return null;
  }
};

function ShiftTable({ data, onEdit, onDelete, dailySalary, overtimeHourlyRate, paymentType, hourlyRate: propHourlyRate, monthlySalary: propMonthlySalary }) {
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [selectedShift, setSelectedShift] = useState(null);

  const openNotesModal = (notes, shift) => {
    setSelectedNotes(notes);
    setSelectedShift(shift);
    setShowNotesModal(true);
  };

  const formatTime = (time) => {
    if (!time) return '--';
    const [hour, min] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:${min.toString().padStart(2, '0')} ${period}`;
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  const calculateShiftSalary = (shift) => {
    // Convert to number in case it's a string from database
    const salary = typeof dailySalary === 'string' ? parseFloat(dailySalary) : dailySalary;
    const otRateValue = typeof overtimeHourlyRate === 'string' ? parseFloat(overtimeHourlyRate) : overtimeHourlyRate;
    const hourly = typeof propHourlyRate === 'string' ? parseFloat(propHourlyRate) : propHourlyRate;
    const monthly = typeof propMonthlySalary === 'string' ? parseFloat(propMonthlySalary) : propMonthlySalary;
    const payType = paymentType || 'hourly';

    let hourlyRate = 0;
    
    if (payType === 'monthly' && monthly > 0) {
      hourlyRate = (monthly / 26) / 8; // monthly / 26 days / 8 hours
    } else if (hourly > 0) {
      hourlyRate = hourly;
    } else if (salary > 0) {
      hourlyRate = salary / 8; // fallback to legacy calculation
    }

    if (hourlyRate <= 0) return null;

    // Overtime rate equals regular hourly rate (1:1)
    const otRate = otRateValue && otRateValue > 0
      ? otRateValue
      : hourlyRate;

    const regularHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
    const overtimeHours = shift.overtimeHours || 0;

    // Get holiday multiplier
    const holidayMultiplier = shift.isHoliday 
      ? (HOLIDAY_MULTIPLIERS[shift.holidayType] || 1.0)
      : 1.0;

    // Calculate base pay and holiday premium
    const baseRegularPay = regularHours * hourlyRate;
    const holidayPremium = baseRegularPay * (holidayMultiplier - 1);
    const regularPay = baseRegularPay + holidayPremium;
    const overtimePay = overtimeHours * otRate;
    const totalShiftPay = regularPay + overtimePay;

    return {
      regularHours,
      overtimeHours,
      hourlyRate: parseFloat(hourlyRate.toFixed(2)),
      baseRegularPay: parseFloat(baseRegularPay.toFixed(2)),
      holidayPremium: parseFloat(holidayPremium.toFixed(2)),
      regularPay: parseFloat(regularPay.toFixed(2)),
      overtimePay: parseFloat(overtimePay.toFixed(2)),
      totalShiftPay: parseFloat(totalShiftPay.toFixed(2)),
      otRate: parseFloat(otRate.toFixed(2)),
      holidayMultiplier,
      isHoliday: shift.isHoliday || false,
      holidayType: shift.holidayType,
      holidayName: shift.holidayName
    };
  }

  const getHolidayBadge = (shift) => {
    if (!shift.isHoliday) return null;
    
    const colors = {
      regular: 'bg-red-100 text-red-700 border-red-200',
      special_non_working: 'bg-orange-100 text-orange-700 border-orange-200',
      special_working: 'bg-blue-100 text-blue-700 border-blue-200'
    };

    return (
      <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium border ${colors[shift.holidayType] || colors.special_working}`}>
        {shift.holidayName} ({getHolidayDisplayName(shift.holidayType)})
      </div>
    );
  };

  const getFaceVerifiedBadge = (shift) => {
    if (shift.faceVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Verified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-lg">
        Manual
      </span>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No shifts recorded yet.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-4 py-4 text-sm font-semibold text-slate-700 rounded-tl-xl">Date</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-700">Morning</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-700">Afternoon</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-700">Overtime</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-700">Total Hours</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-700">Verification</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-700">Status</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-700">Notes</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-700">Shift Salary</th>
              <th className="px-4 py-4 text-sm font-semibold text-slate-700 rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((shift) => {
              const salary = calculateShiftSalary(shift);
              return (
                <tr key={shift.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-slate-700">
                    <div>{formatDate(shift.date)}</div>
                    {getHolidayBadge(shift)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700">{formatTime(shift.morningTimeIn)} - {formatTime(shift.morningTimeOut)}</div>
                    <div className="text-xs text-slate-500">{shift.morningHours} hrs</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700">{formatTime(shift.afternoonTimeIn)} - {formatTime(shift.afternoonTimeOut)}</div>
                    <div className="text-xs text-slate-500">{shift.afternoonHours} hrs</div>
                  </td>
                  <td className="px-4 py-4">
                    {shift.overtimeTimeIn ? (
                      <>
                        <div className="text-sm text-slate-700">
                          {formatTime(shift.overtimeTimeIn)} - {formatTime(shift.overtimeTimeOut)}
                        </div>
                        <div className="text-xs text-slate-500">{shift.overtimeHours} hrs</div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">No overtime</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-800">{shift.totalHours} hrs</td>

                  {/* ── Face verified column ── */}
                  <td className="px-4 py-4">
                    {getFaceVerifiedBadge(shift)}
                  </td>

                  <td className="px-4 py-4">
                    {shift.isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                        Unpaid
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {shift.notes ? (
                      <button
                        onClick={() => openNotesModal(shift.notes, shift)}
                        className="text-sm text-slate-700 max-w-[200px] line-clamp-2 hover:text-primary hover:underline text-left transition-colors"
                      >
                        {shift.notes}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {salary ? (
                      <div className="text-sm">
                        <div className="font-semibold text-green-600">₱{salary.totalShiftPay.toFixed(2)}</div>
                        {salary.overtimeHours > 0 && (
                          <div className="text-xs text-slate-400">
                            OT: ₱{salary.overtimePay.toFixed(2)}
                          </div>
                        )}
                        {salary.isHoliday && salary.holidayPremium > 0 && (
                          <div className="text-xs text-orange-600 font-medium">
                            Holiday premium: +₱{salary.holidayPremium.toFixed(2)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No salary data</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onEdit(shift)}
                        className="text-sm text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                      >
                        <RiEditLine className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(shift)}
                        className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 font-medium"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 100 }}
          onClick={() => setShowNotesModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Shift Notes</h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RiCloseLine className="w-6 h-6" />
              </button>
            </div>

            {selectedShift && (
              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-xs text-slate-500">
                  <span className="font-semibold">Date:</span> {new Date(selectedShift.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedNotes}</p>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowNotesModal(false)}
                className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-light transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ShiftTable;
