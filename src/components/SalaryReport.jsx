import { useState, useEffect } from 'react';
import { getCurrentMonthRange } from '../utils/dateUtils';

function SalaryReport({ monthlySalary, overtimeHourlyRate, shifts }) {
  const [salaryData, setSalaryData] = useState(null);

  useEffect(() => {
    // Convert to number in case it's a string from database
    const salary = typeof monthlySalary === 'string' ? parseFloat(monthlySalary) : monthlySalary;
    const otRateValue = typeof overtimeHourlyRate === 'string' ? parseFloat(overtimeHourlyRate) : overtimeHourlyRate;

    if (!salary || salary <= 0) return;

    const hourlyRate = salary / 176; // 8 hrs × 22 days
    // Overtime rate equals regular hourly rate (1:1)
    const otRate = otRateValue && otRateValue > 0
      ? otRateValue
      : hourlyRate;

    let totalRegularHours = 0;
    let totalOvertimeHours = 0;

    shifts.forEach(shift => {
      totalRegularHours += (shift.morningHours || 0) + (shift.afternoonHours || 0);
      totalOvertimeHours += shift.overtimeHours || 0;
    });

    // Calculate pay based on actual hours worked
    const regularPay = totalRegularHours * hourlyRate;
    const overtimePay = totalOvertimeHours * otRate;
    const currentMonthPay = regularPay + overtimePay;

    setSalaryData({
      totalRegularHours: parseFloat(totalRegularHours.toFixed(2)),
      totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
      regularPay: parseFloat(regularPay.toFixed(2)),
      hourlyRate: parseFloat(hourlyRate.toFixed(2)),
      overtimeRate: parseFloat(otRate.toFixed(2)),
      overtimePay: parseFloat(overtimePay.toFixed(2)),
      currentMonthPay: parseFloat(currentMonthPay.toFixed(2)),
      baseSalary: salary
    });
  }, [monthlySalary, overtimeHourlyRate, shifts]);

  // Convert to number for check
  const salary = typeof monthlySalary === 'string' ? parseFloat(monthlySalary) : monthlySalary;
  if (!salary || salary <= 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-amber-700 text-sm font-semibold">Salary information not set</p>
        <p className="text-amber-600 text-xs mt-1">Please contact HR to set your salary details</p>
      </div>
    );
  }

  if (!salaryData) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Salary Computation</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded-xl">
          <p className="text-xs text-slate-500 font-semibold">Base Salary</p>
          <p className="text-xl font-bold text-slate-800">₱{salaryData.baseSalary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl">
          <p className="text-xs text-slate-500 font-semibold">Hourly Rate</p>
          <p className="text-xl font-bold text-slate-800">₱{salaryData.hourlyRate.toFixed(2)}/hr</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-xs text-blue-600 font-semibold">Regular Hours</p>
          <p className="text-xl font-bold text-blue-800">{salaryData.totalRegularHours.toFixed(2)} hrs</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-xs text-blue-600 font-semibold">Overtime Hours</p>
          <p className="text-xl font-bold text-blue-800">{salaryData.totalOvertimeHours.toFixed(2)} hrs</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-green-700 font-semibold">Overtime Pay ({salaryData.totalOvertimeHours.toFixed(2)} hrs × ₱{salaryData.overtimeRate.toFixed(2)})</p>
            <p className="text-lg text-green-600 font-medium">₱{salaryData.overtimePay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-700 font-semibold">Current Month Pay</p>
            <p className="text-3xl font-bold text-green-800">₱{salaryData.currentMonthPay.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold">Note:</span>
        <span>Regular hours paid at ₱{salaryData.hourlyRate.toFixed(2)}/hr + Overtime at ₱{salaryData.overtimeRate.toFixed(2)}/hr. Base salary: ₱{salaryData.baseSalary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}.</span>
      </div>
    </div>
  );
}

export default SalaryReport;
