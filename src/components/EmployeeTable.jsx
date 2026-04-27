import { RiCalendarEventLine, RiEditLine, RiDeleteBinLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { calculateShiftPay } from '../utils/salaryCalculator';
import { getFridaysInMonth, formatDate } from '../utils/dateUtils';

function EmployeeTable({
  employees,
  loading,
  onViewHistory,
  onEdit,
  onDelete,
  onPaySalary,
  shifts = [],
  currentMonth
}) {
  const calculateRemainingSalary = (emp) => {
    if (!emp) return 0;
    
    const paymentType = emp.paymentType || 'hourly';
    const hourlyRate = parseFloat(emp.hourlyRate) || 0;
    const monthlySalary = parseFloat(emp.monthlySalary) || 0;
    const dailySalary = parseFloat(emp.dailySalary) || 0;
    const overtimeHourlyRate = parseFloat(emp.overtimeHourlyRate) || 0;
    
    // Get ALL unpaid shifts for this employee (Global Balance)
    const unpaidShifts = (shifts || []).filter(s => 
      s.employeeId === emp.id && 
      !s.isPaid
    );
    
    const isMonthly = paymentType === 'monthly' || monthlySalary > 0;
    
    if (isMonthly) {
      // For monthly employees: Full Fixed Salary + Extras (OT/Holidays)
      // We prioritize Monthly Salary if it's set (> 0)
      const baseSalary = monthlySalary > 0 ? monthlySalary : (dailySalary * 26);
      const baseHourlyRate = (baseSalary / 26) / 8;
      
      let overtimeTotal = 0;
      let holidayPremiumTotal = 0;
      
      unpaidShifts.forEach(shift => {
        // OT portion
        const otRate = overtimeHourlyRate || baseHourlyRate;
        overtimeTotal += (shift.overtimeHours || 0) * otRate;
        
        // Holiday premium portion
        if (shift.isHoliday) {
          const regHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
          const multiplier = shift.holidayType === 'regular' ? 1.0 : 
                            shift.holidayType === 'special_non_working' ? 0.3 : 0;
          holidayPremiumTotal += (regHours * baseHourlyRate * multiplier);
        }
      });

      const finalTotal = baseSalary + overtimeTotal + holidayPremiumTotal;
      console.log(`%c[DEBUG Table] ${emp.firstName}: Base=${baseSalary}, OT=${overtimeTotal}, Holiday=${holidayPremiumTotal}, Total=${finalTotal}`, "color: white; background: darkorange; font-weight: bold; padding: 2px 4px; border-radius: 2px;");
      return finalTotal;
    } else {
      // For hourly/daily employees: Sum of all unpaid shifts
      if (unpaidShifts.length === 0) return 0;
      
      let total = 0;
      const effectiveHourlyRate = hourlyRate > 0 ? hourlyRate : (dailySalary / 8);
      const effectiveOtRate = overtimeHourlyRate || (effectiveHourlyRate * 1.25);

      unpaidShifts.forEach(shift => {
        total += calculateShiftPay(shift, effectiveHourlyRate, effectiveOtRate);
      });
      return parseFloat(total.toFixed(2));
    }
  };

  const shouldShowRemainingSalary = (emp) => {
    // Always show remaining salary for active employees if they have unpaid shifts
    return !!emp;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-12 text-center text-slate-400 text-sm">
          Loading employees...
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-12 text-center text-slate-400 text-sm">
          No employees found matching your criteria.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-left">
              <th className="px-4 py-4 text-sm font-semibold text-white rounded-tl-xl">Employee ID</th>
              <th className="px-4 py-4 text-sm font-semibold text-white">Name</th>
              <th className="px-4 py-4 text-sm font-semibold text-white">Position</th>
              <th className="px-4 py-4 text-sm font-semibold text-white">Payment Type</th>
              <th className="px-4 py-4 text-sm font-semibold text-white">Salary Rate</th>
              <th className="px-4 py-4 text-sm font-semibold text-white">Remaining</th>
              <th className="px-4 py-4 text-sm font-semibold text-white">Status</th>
              <th className="px-4 py-4 text-sm font-semibold text-white rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const paymentType = emp.paymentType || 'hourly';
              const hourlyRate = parseFloat(emp.hourlyRate) || 0;
              const monthlySalary = parseFloat(emp.monthlySalary) || 0;
              const dailySalary = parseFloat(emp.dailySalary) || 0;
              
              let salaryDisplay = '';
              if (paymentType === 'monthly' && monthlySalary > 0) {
                salaryDisplay = `₱${monthlySalary.toLocaleString()}/mo`;
              } else if (hourlyRate > 0) {
                salaryDisplay = `₱${hourlyRate.toFixed(2)}/hr`;
              } else if (dailySalary > 0) {
                salaryDisplay = `₱${dailySalary.toFixed(2)}/day`;
              }
              
              const remaining = calculateRemainingSalary(emp);
              const showRemaining = shouldShowRemainingSalary(emp);
              
              return (
                <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-slate-800">{emp.employeeId}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{emp.firstName} {emp.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600">{emp.position || '-'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      paymentType === 'monthly'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {paymentType === 'monthly' ? 'Monthly' : 'Hourly'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-600 font-medium">{salaryDisplay || '-'}</span>
                  </td>
                  <td className="px-4 py-4">
                    {showRemaining && remaining > 0 ? (
                      <span className="text-sm font-semibold text-amber-600">₱{remaining.toFixed(2)}</span>
                    ) : showRemaining ? (
                      <span className="text-sm text-slate-500 font-medium">₱0.00</span>
                    ) : (
                      <span className="text-xs text-slate-400">--</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                      emp.isActive
                        ? 'bg-success-bg text-success'
                        : 'bg-danger-bg text-danger'
                    }`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onPaySalary && onPaySalary(emp)}
                        className="flex items-center gap-1 px-2 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
                        title="Pay Salary"
                      >
                        <RiMoneyDollarCircleLine className="w-4 h-4" />
                        Pay
                      </button>
                      <button
                        onClick={() => onViewHistory(emp)}
                        className="flex items-center gap-1 px-2 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
                        title="View Shift History"
                      >
                        <RiCalendarEventLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(emp)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <RiEditLine className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(emp)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeTable;
