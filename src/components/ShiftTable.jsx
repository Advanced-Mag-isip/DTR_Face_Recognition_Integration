import { RiEditLine } from 'react-icons/ri';
import { RiDeleteBinLine } from 'react-icons/ri';

function ShiftTable({ data, onEdit, onDelete, monthlySalary, overtimeHourlyRate }) {
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
    const salary = typeof monthlySalary === 'string' ? parseFloat(monthlySalary) : monthlySalary;
    const otRateValue = typeof overtimeHourlyRate === 'string' ? parseFloat(overtimeHourlyRate) : overtimeHourlyRate;
    
    if (!salary || salary <= 0) return null;
    
    const hourlyRate = salary / 176; // 8 hrs × 22 days
    // Overtime rate equals regular hourly rate (1:1)
    const otRate = otRateValue && otRateValue > 0 
      ? otRateValue 
      : hourlyRate;
    
    const regularHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
    const overtimeHours = shift.overtimeHours || 0;
    
    // Calculate pay for this shift
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * otRate;
    const totalShiftPay = regularPay + overtimePay;
    
    return {
      regularHours,
      overtimeHours,
      regularPay: parseFloat(regularPay.toFixed(2)),
      overtimePay: parseFloat(overtimePay.toFixed(2)),
      totalShiftPay: parseFloat(totalShiftPay.toFixed(2)),
      otRate: parseFloat(otRate.toFixed(2))
    };
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 text-sm">
        No shifts recorded yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="px-4 py-4 text-sm font-semibold text-slate-700 rounded-tl-xl">Date</th>
            <th className="px-4 py-4 text-sm font-semibold text-slate-700">Morning</th>
            <th className="px-4 py-4 text-sm font-semibold text-slate-700">Afternoon</th>
            <th className="px-4 py-4 text-sm font-semibold text-slate-700">Overtime</th>
            <th className="px-4 py-4 text-sm font-semibold text-slate-700">Total Hours</th>
            <th className="px-4 py-4 text-sm font-semibold text-slate-700">Shift Salary</th>
            <th className="px-4 py-4 text-sm font-semibold text-slate-700 rounded-tr-xl">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((shift) => {
            const salary = calculateShiftSalary(shift);
            return (
              <tr key={shift.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 text-sm text-slate-700">{formatDate(shift.date)}</td>
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
                <td className="px-4 py-4">
                  {salary ? (
                    <div className="text-sm">
                      <div className="font-semibold text-green-600">₱{salary.totalShiftPay.toFixed(2)}</div>
                      {salary.overtimeHours > 0 && (
                        <div className="text-xs text-slate-400">
                          OT: ₱{salary.overtimePay.toFixed(2)}
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
  );
}

export default ShiftTable;
