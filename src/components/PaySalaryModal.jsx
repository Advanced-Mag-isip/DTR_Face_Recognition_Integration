import { useState, useEffect } from 'react';
import { RiMoneyDollarCircleLine, RiCheckboxCircleLine, RiCloseLine, RiCheckboxBlankCircleLine } from 'react-icons/ri';
import { getUnpaidShifts, payShifts } from '../utils/salaryApi';
import { calculateShiftPay } from '../utils/salaryCalculator';

function PaySalaryModal({ isOpen, onClose, employees, lockedEmployee }) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('second');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [unpaidData, setUnpaidData] = useState(null);
  const [loadingUnpaid, setLoadingUnpaid] = useState(false);
  const [selectedShiftIds, setSelectedShiftIds] = useState([]);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  }, []);

  useEffect(() => {
    const empId = lockedEmployee ? lockedEmployee.id : '';
    if (empId && selectedMonth && selectedPeriod) {
      fetchUnpaidShifts(empId, selectedPeriod, selectedMonth);
    } else if (!lockedEmployee && selectedEmployeeId && selectedMonth && selectedPeriod) {
      fetchUnpaidShifts(selectedEmployeeId, selectedPeriod, selectedMonth);
    } else {
      setUnpaidData(null);
    }
  }, [selectedEmployeeId, selectedPeriod, selectedMonth, lockedEmployee]);

  const fetchUnpaidShifts = async (empId, period, month) => {
    setLoadingUnpaid(true);
    try {
      const data = await getUnpaidShifts(empId, period, month);
      setUnpaidData(data);
      setSelectedShiftIds(data.shifts.map(s => s.id));
    } catch (err) {
      console.error('Error fetching unpaid shifts:', err);
      setUnpaidData(null);
    } finally {
      setLoadingUnpaid(false);
    }
  };

  const handlePay = async () => {
    const empId = lockedEmployee ? lockedEmployee.id : selectedEmployeeId;
    if (!empId || !selectedPeriod) return;

    setPaying(true);
    try {
      const result = await payShifts({
        employeeId: empId,
        shiftIds: selectedShiftIds,
        payPeriod: selectedPeriod,
        month: selectedMonth
      });
      setPaymentSuccess(result);
    } catch (err) {
      console.error('Error paying shifts:', err);
      alert(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setPaying(false);
    }
  };

  const handleClose = () => {
    setSelectedEmployeeId('');
    setSelectedPeriod('second');
    setUnpaidData(null);
    setSelectedShiftIds([]);
    setPaymentSuccess(null);
    onClose();
  };

  const toggleShift = (shiftId) => {
    setSelectedShiftIds(prev =>
      prev.includes(shiftId)
        ? prev.filter(id => id !== shiftId)
        : [...prev, shiftId]
    );
  };

  const selectAll = () => {
    if (unpaidData) {
      setSelectedShiftIds(unpaidData.shifts.map(s => s.id));
    }
  };

  const deselectAll = () => {
    setSelectedShiftIds([]);
  };

  const calculateSelectedAmount = () => {
    if (!unpaidData || selectedShiftIds.length === 0) return 0;

    const { employee } = unpaidData;
    const { paymentType, hourlyRate, monthlySalary, overtimeHourlyRate } = employee;
    const selectedShifts = unpaidData.shifts.filter(s => selectedShiftIds.includes(s.id));

    let total = 0;
    const otRate = overtimeHourlyRate ? parseFloat(overtimeHourlyRate) : null;
    
    if (paymentType === 'monthly' && monthlySalary > 0) {
      // If 1st cut-off is selected for a monthly employee, they get 0 (paid only monthly)
      if (selectedPeriod === 'first') {
        return 0;
      }

      const baseHourlyRate = (monthlySalary / 26) / 8;
      let overtimeTotal = 0;
      let holidayPremiumTotal = 0;
      
      selectedShifts.forEach(shift => {
        // OT portion
        const otRate = overtimeHourlyRate ? parseFloat(overtimeHourlyRate) : baseHourlyRate;
        overtimeTotal += (shift.overtimeHours || 0) * otRate;
        
        // Holiday premium portion
        if (shift.isHoliday) {
          const regHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
          const multiplier = shift.holidayType === 'regular' ? 1.0 : 
                            shift.holidayType === 'special_non_working' ? 0.3 : 0;
          holidayPremiumTotal += (regHours * baseHourlyRate * multiplier);
        }
      });
      
      const finalTotal = monthlySalary + overtimeTotal + holidayPremiumTotal;
      console.log(`%c[DEBUG Modal] Base=${monthlySalary}, OT=${overtimeTotal}, Holiday=${holidayPremiumTotal}, Total=${finalTotal}`, "color: white; background: green; font-weight: bold; padding: 2px 4px; border-radius: 2px;");
      
      // Full Fixed Monthly Salary + Extras
      total = finalTotal;
    } else if (hourlyRate > 0 || dailySalary > 0) {
      const effectiveHourlyRate = hourlyRate > 0 ? hourlyRate : (dailySalary / 8);
      const effectiveOtRate = overtimeHourlyRate ? parseFloat(overtimeHourlyRate) : (effectiveHourlyRate * 1.25);
      
      selectedShifts.forEach(shift => {
        total += calculateShiftPay(shift, effectiveHourlyRate, effectiveOtRate);
      });
    }

    return parseFloat(total.toFixed(2));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (time) => {
    if (!time) return '--';
    const [hour, min] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:${min.toString().padStart(2, '0')} ${period}`;
  };

  const getPeriodLabel = (period) => {
    const [year, monthNum] = selectedMonth.split('-').map(Number);
    const monthName = new Date(year, monthNum - 1).toLocaleString('default', { month: 'long' });

    if (period === 'first') {
      return `1st Cut-off (Every 2nd Friday)`;
    } else if (period === 'monthly') {
      return `Monthly (Last Friday of ${monthName})`;
    } else {
      return `2nd Cut-off (Last Friday of ${monthName})`;
    }
  };

  if (!isOpen) return null;

  const getEmployeeDisplay = () => {
    if (lockedEmployee) {
      return `${lockedEmployee.firstName} ${lockedEmployee.lastName} (${lockedEmployee.employeeId})`;
    }
    const emp = employees.find(e => e.id === parseInt(selectedEmployeeId));
    return emp ? `${emp.firstName} ${emp.lastName} (${emp.employeeId})` : '';
  };

  const getCurrentEmployeePaymentType = () => {
    if (lockedEmployee?.paymentType === 'monthly') return 'monthly';
    const emp = employees.find(e => e.id === parseInt(selectedEmployeeId));
    return emp?.paymentType === 'monthly' ? 'monthly' : 'hourly';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[95vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2.5 rounded-xl">
              <RiMoneyDollarCircleLine className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Pay Salary</h2>
              <p className="text-xs text-slate-500">Mark shifts as paid for employee</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {paymentSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiCheckboxCircleLine className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Payment Successful!</h3>
              <p className="text-slate-600 mb-4">{paymentSuccess.paidCount} shift(s) marked as paid</p>
              <div className="bg-slate-50 rounded-xl p-4 text-left max-w-sm mx-auto">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Amount:</span> ₱{paymentSuccess.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Paid At:</span> {new Date(paymentSuccess.paidAt).toLocaleString()}
                </p>
              </div>
              <button onClick={handleClose} className="mt-6 bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold">
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Employee</label>
                  {lockedEmployee ? (
                    <div className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-sm font-medium text-slate-800">
                      {getEmployeeDisplay()}
                    </div>
                  ) : (
                    <select
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                    >
                      <option value="">Select employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeId})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Pay Period</label>
                  {getCurrentEmployeePaymentType() === 'monthly' ? (
                    <div className="w-full px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">
                      Monthly (Last Friday of the month)
                    </div>
                  ) : (
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm"
                    >
                      <option value="first">1st Cut-off (Every 2nd Friday)</option>
                      <option value="second">2nd Cut-off (Last Friday)</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Unpaid Shifts ({unpaidData?.unpaidCount || 0})
                  </h3>
                  {unpaidData && unpaidData.shifts.length > 0 && (
                    <div className="flex gap-2">
                      <button onClick={selectAll} className="text-xs text-primary font-medium hover:underline">Select All</button>
                      <span className="text-slate-300">|</span>
                      <button onClick={deselectAll} className="text-xs text-slate-500 font-medium hover:underline">Deselect All</button>
                    </div>
                  )}
                </div>

                {loadingUnpaid ? (
                  <div className="text-center py-8 text-slate-400">Loading...</div>
                ) : !unpaidData || unpaidData.shifts.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <p className="text-slate-500 text-sm">No unpaid shifts found for this period</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                    {unpaidData.shifts.map(shift => (
                      <div
                        key={shift.id}
                        onClick={() => toggleShift(shift.id)}
                        className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 ${
                          selectedShiftIds.includes(shift.id) ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedShiftIds.includes(shift.id) ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'
                        }`}>
                          {selectedShiftIds.includes(shift.id) && <RiCheckboxCircleLine className="w-3 h-3" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{formatDate(shift.date)}</p>
                          <p className="text-xs text-slate-500">
                            {formatTime(shift.morningTimeIn)}-{formatTime(shift.morningTimeOut)} | 
                            {formatTime(shift.afternoonTimeIn)}-{formatTime(shift.afternoonTimeOut)}
                            {shift.overtimeTimeIn && ` | OT: ${shift.overtimeHours}h`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {unpaidData && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">
                        Selected: {selectedShiftIds.length} shift(s)
                      </p>
                      <p className="text-xs text-green-600">
                        {unpaidData.employee.paymentDetails || 'Cash'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-green-600">Total Amount</p>
                      <p className="text-2xl font-bold text-green-700">
                        ₱{calculateSelectedAmount().toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!paymentSuccess && (
          <div className="p-6 border-t border-slate-100 flex gap-3">
            <button onClick={handleClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={(!selectedEmployeeId && !lockedEmployee) || !unpaidData || selectedShiftIds.length === 0 || paying}
              className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50"
            >
              {paying ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaySalaryModal;
