import { useState, useEffect } from 'react';
import { RiMoneyDollarCircleLine, RiCalendarCheckLine, RiTimeLine, RiBankCardLine } from 'react-icons/ri';
import { RiInformationLine } from 'react-icons/ri';
import { getCurrentMonthRange } from '../utils/dateUtils';
import { getSalaryForPeriod } from '../utils/salaryApi';

function SalaryReport({ dailySalary, overtimeHourlyRate, shifts, employeeId, paymentType, hourlyRate: propHourlyRate, monthlySalary: propMonthlySalary }) {
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const fetchSalaryData = async () => {
      setLoading(true);
      try {
        const range = getCurrentMonthRange();
        const data = await getSalaryForPeriod(range.startDate, range.endDate, employeeId);
        setSalaryData(data);
      } catch (err) {
        console.error('Error fetching salary data:', err);
        calculateLocalSalary();
      } finally {
        setLoading(false);
      }
    };

    const calculateLocalSalary = () => {
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

      if (hourlyRate <= 0) return;

      const otRate = otRateValue && otRateValue > 0 ? otRateValue : hourlyRate;

      let totalRegularHours = 0;
      let totalOvertimeHours = 0;
      const uniqueWorkDays = new Set();

      shifts.forEach(shift => {
        totalRegularHours += (shift.morningHours || 0) + (shift.afternoonHours || 0);
        totalOvertimeHours += shift.overtimeHours || 0;
        if (shift.date) {
          uniqueWorkDays.add(shift.date);
        }
      });

      const daysWorked = uniqueWorkDays.size;
      const regularPay = totalRegularHours * hourlyRate;
      const overtimePay = totalOvertimeHours * otRate;
      const currentMonthPay = regularPay + overtimePay;

      setSalaryData({
        daysWorked,
        totalRegularHours: parseFloat(totalRegularHours.toFixed(2)),
        totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
        regularPay: parseFloat(regularPay.toFixed(2)),
        hourlyRate: parseFloat(hourlyRate.toFixed(2)),
        overtimeRate: parseFloat(otRate.toFixed(2)),
        overtimePay: parseFloat(overtimePay.toFixed(2)),
        grossPay: parseFloat(currentMonthPay.toFixed(2)),
        baseSalary: parseFloat(regularPay.toFixed(2)),
        dailySalary: salary,
        monthlySalary: monthly,
        paymentType: payType,
        breakdown: {
          normal: { label: 'Normal Days', daysWorked, totalPay: parseFloat(regularPay.toFixed(2)) },
          regular: { label: 'Regular Holidays', daysWorked: 0, totalPay: 0 },
          specialNonWorking: { label: 'Special Non-Working', daysWorked: 0, totalPay: 0 },
          specialWorking: { label: 'Special Working', daysWorked: 0, totalPay: 0 }
        }
      });
    };

    fetchSalaryData();
  }, [dailySalary, overtimeHourlyRate, shifts, employeeId, paymentType, propHourlyRate, propMonthlySalary]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-32 mx-auto mb-4"></div>
          <div className="h-3 bg-slate-100 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!salaryData) return null;

  // Use data from API if available, otherwise fall back to props
  const salary = salaryData.dailySalary || (typeof dailySalary === 'string' ? parseFloat(dailySalary) : dailySalary);
  
  // Payment type - must be defined before use
  const payType = salaryData.paymentType || paymentType || 'hourly';
  const displayHourlyRate = salaryData.hourlyRate || propHourlyRate || (salaryData.dailyRate ? salaryData.dailyRate / 8 : 0);
  const displayMonthlySalary = salaryData.monthlySalary || propMonthlySalary || 0;
  const displayDailyRate = salaryData.dailyRate || (displayHourlyRate * 8);
  
  // Validate based on payment type
  const isValidSalary = payType === 'monthly' 
    ? (displayMonthlySalary > 0 || salary > 0)
    : (displayHourlyRate > 0 || salary > 0);
  
  if (!isValidSalary) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-amber-700 text-sm font-semibold">
          {payType === 'monthly' ? 'Monthly salary' : 'Hourly rate'} not set
        </p>
        <p className="text-amber-600 text-xs mt-1">Please contact HR to set your salary details</p>
      </div>
    );
  }

  const breakdown = salaryData.breakdown || {};
  const totalHolidayPremium = salaryData.totalHolidayPremium || 0;
  const hasHolidays = (breakdown.regular?.daysWorked || 0) > 0 ||
                      (breakdown.specialNonWorking?.daysWorked || 0) > 0 ||
                      (breakdown.specialWorking?.daysWorked || 0) > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800">Salary Computation</h3>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showBreakdown}
              onChange={(e) => setShowBreakdown(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-600 font-medium">Show breakdown</span>
          </label>
        </div>
      </div>

      {/* Summary Row - Always Visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {payType === 'monthly' ? (
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500 font-medium">Monthly Salary</p>
            <p className="text-base font-bold text-slate-800">₱{displayMonthlySalary?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>
        ) : (
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500 font-medium">Hourly Rate</p>
            <p className="text-base font-bold text-slate-800">₱{displayHourlyRate?.toFixed(2)}</p>
          </div>
        )}
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 font-medium">Days Worked</p>
          <p className="text-base font-bold text-slate-800">{salaryData.daysWorked}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 font-medium">{payType === 'monthly' ? 'Daily Rate' : 'Hourly Rate'}</p>
          <p className="text-base font-bold text-slate-800">₱{(payType === 'monthly' ? displayDailyRate : displayHourlyRate)?.toFixed(2)}</p>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 font-medium">OT Hours</p>
          <p className="text-base font-bold text-slate-800">{salaryData.totalOvertimeHours?.toFixed(2)}</p>
        </div>
      </div>

      {/* Expanded Breakdown */}
      {showBreakdown && (
        <div className="border-t border-slate-200 pt-4 space-y-4">
          {/* Holiday Breakdown */}
          {hasHolidays && (
            <div>
              <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Holiday Work</h4>
              <div className="space-y-2">
                {breakdown.regular?.daysWorked > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-red-800">Regular Holiday</p>
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded font-medium">2x Pay</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-red-700 mb-1">
                      <span>{breakdown.regular.daysWorked} day(s) × ₱{displayDailyRate?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      <span>Base: ₱{(breakdown.regular.basePay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-red-700 mb-2">
                      <span>Holiday Premium (100%)</span>
                      <span>+₱{(breakdown.regular.holidayPremium || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-red-200">
                      <span className="text-xs font-medium text-red-700">Total</span>
                      <p className="text-sm font-bold text-red-800">₱{(breakdown.regular.totalPay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                )}
                {breakdown.specialNonWorking?.daysWorked > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-orange-800">Special Non-Working</p>
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded font-medium">1.3x Pay</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-orange-700 mb-1">
                      <span>{breakdown.specialNonWorking.daysWorked} day(s) × ₱{displayDailyRate?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      <span>Base: ₱{(breakdown.specialNonWorking.basePay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-orange-700 mb-2">
                      <span>Holiday Premium (30%)</span>
                      <span>+₱{(breakdown.specialNonWorking.holidayPremium || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                      <span className="text-xs font-medium text-orange-700">Total</span>
                      <p className="text-sm font-bold text-orange-800">₱{(breakdown.specialNonWorking.totalPay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                )}
                {breakdown.specialWorking?.daysWorked > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-blue-800">Special Working</p>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-medium">Normal Pay</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                      <span>{breakdown.specialWorking.daysWorked} day(s) × ₱{displayDailyRate?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      <span>Total: ₱{(breakdown.specialWorking.totalPay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                      <span className="text-xs font-medium text-blue-700">Total</span>
                      <p className="text-sm font-bold text-blue-800">₱{(breakdown.specialWorking.totalPay || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Earnings Summary */}
          <div>
            <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Earnings Summary</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <span className="text-sm text-slate-600 block">Base Pay</span>
                  <span className="text-xs text-slate-400">All days worked × daily rate</span>
                </div>
                <span className="text-sm font-semibold text-slate-800">₱{salaryData.baseSalary?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
              {salaryData.overtimePay > 0 && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <span className="text-sm text-slate-600 block">Overtime Pay</span>
                    <span className="text-xs text-slate-400">{salaryData.totalOvertimeHours?.toFixed(2)} hrs × ₱{salaryData.overtimeRate?.toFixed(2)}/hr</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">₱{salaryData.overtimePay?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {totalHolidayPremium > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <span className="text-sm text-blue-700 block">Holiday Premium</span>
                    <span className="text-xs text-blue-600">Extra pay for holiday work</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">+₱{totalHolidayPremium.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Gross Pay</p>
                <p className="text-2xl font-bold">₱{salaryData.grossPay?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              </div>
              <RiBankCardLine className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
            <RiInformationLine className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">Holiday Pay Rates:</p>
              <ul className="space-y-1 text-slate-500">
                <li>• <strong>Regular Holiday (2x):</strong> 100% premium on top of base pay</li>
                <li>• <strong>Special Non-Working (1.3x):</strong> 30% premium on top of base pay</li>
                <li>• <strong>Special Working:</strong> Normal pay rate (no premium)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Total (when breakdown is hidden) */}
      {!showBreakdown && (
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <RiBankCardLine className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Gross Pay</p>
                <p className="text-xl font-bold text-slate-800">₱{salaryData.grossPay?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <button
              onClick={() => setShowBreakdown(true)}
              className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700"
            >
              View details <RiInformationLine className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalaryReport;
