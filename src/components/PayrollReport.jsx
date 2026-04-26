import { useState, useEffect } from 'react';
import { RiFileTextLine, RiDownloadLine, RiEditLine, RiCheckboxCircleLine, RiCloseLine, RiCalendarLine, RiGroupLine, RiMoneyDollarCircleLine } from 'react-icons/ri';
import { savePayrollNote } from '../utils/usersApi';

function PayrollReport({ employees, shifts, departments = [] }) {
  const [selectedCycle, setSelectedCycle] = useState('first');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [reportData, setReportData] = useState({ hourly: [], monthly: [] });
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  }, []);

  const getCycleDates = (cycle, month) => {
    if (!month || !month.includes('-')) {
      const now = new Date();
      const year = now.getFullYear();
      const monthNum = now.getMonth() + 1;
      month = `${year}-${String(monthNum).padStart(2, '0')}`;
    }
    
    const [year, monthNum] = month.split('-').map(Number);
    const monthStart = new Date(year, monthNum - 1, 1);
    const monthEnd = new Date(year, monthNum, 0);
    
    if (cycle === 'first') {
      return {
        label: `PAYROLL (FIRST HALF)`,
        subtitle: `${monthStart.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })} - Paid every Friday of 2nd week`,
        startDate: monthStart.toISOString().split('T')[0],
        endDate: new Date(year, monthNum - 1, 15).toISOString().split('T')[0]
      };
    } else if (cycle === 'second') {
      return {
        label: `PAYROLL (SECOND HALF)`,
        subtitle: `${monthStart.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })} - Paid every last Friday`,
        startDate: new Date(year, monthNum - 1, 16).toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0]
      };
    } else {
      return {
        label: `PAYROLL - MONTHLY`,
        subtitle: `${monthStart.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })} - Monthly Rate`,
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0]
      };
    }
  };

  const generateReport = () => {
    setLoading(true);
    
    try {
      const dates = getCycleDates(selectedCycle, selectedMonth);
      const startDate = dates.startDate;
      const endDate = dates.endDate;
      
      const filteredEmployees = selectedDepartment === 'all' 
        ? employees 
        : employees.filter(emp => emp.department === selectedDepartment);
      
      const hourlyEmployees = filteredEmployees
        .filter(emp => emp.isActive !== false && (emp.paymentType === 'hourly' || !emp.paymentType))
        .map(emp => {
          const empShifts = shifts.filter(s => 
            s.employeeId === emp.id && 
            s.date >= startDate && 
            s.date <= endDate
          );
          
          const dailySalary = parseFloat(emp.dailySalary) || 0;
          const hourlyRate = parseFloat(emp.hourlyRate) || 0;
          const overtimeHourlyRate = parseFloat(emp.overtimeHourlyRate) || hourlyRate;
          
          const daysWorked = empShifts.length;
          const paidShifts = empShifts.filter(s => s.isPaid);
          const unpaidShifts = empShifts.filter(s => !s.isPaid);
          let amount = 0;
          let overtimeHours = 0;
          let holidayNote = '';
          
          const holidayShifts = empShifts.filter(s => s.isHoliday);
          if (holidayShifts.length > 0) {
            const holidays = [...new Set(holidayShifts.map(s => s.holidayName))];
            holidayNote = holidays.join(', ');
          }
          
          empShifts.forEach(shift => {
            overtimeHours += shift.overtimeHours || 0;
            if (dailySalary > 0) {
              amount += dailySalary;
            } else if (hourlyRate > 0) {
              const regHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
              const otHours = shift.overtimeHours || 0;
              amount += (regHours * hourlyRate) + (otHours * overtimeHourlyRate);
            }
          });
          
          return {
            id: emp.id,
            name: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.employeeId,
            department: emp.department || '-',
            rate: dailySalary > 0 ? `${dailySalary}/day` : hourlyRate > 0 ? `${hourlyRate}/hr` : '-',
            paymentDetails: emp.paymentDetails || emp.paymentMethod || '-',
            days: daysWorked,
            paidDays: paidShifts.length,
            adjustments: '',
            amount: amount,
            status: paidShifts.length === daysWorked && daysWorked > 0 ? 'PAID' : unpaidShifts.length > 0 ? 'UNPAID' : '-',
            note: (() => {
              let savedNotes = {};
              try {
                if (emp.payrollNotes) {
                  savedNotes = typeof emp.payrollNotes === 'string' ? JSON.parse(emp.payrollNotes) : emp.payrollNotes;
                }
              } catch (e) { savedNotes = {}; }
              return savedNotes[`${selectedCycle}-${selectedMonth}`] || holidayNote || (overtimeHours > 0 ? `${overtimeHours} OT hours` : '');
            })()
          };
        })
        .filter(r => r.days > 0);

      const monthlyEmployees = filteredEmployees
        .filter(emp => emp.isActive !== false && emp.paymentType === 'monthly')
        .map(emp => {
          const monthlySalary = parseFloat(emp.monthlySalary) || 0;
          const empShifts = shifts.filter(s => 
            s.employeeId === emp.id && 
            s.date >= startDate && 
            s.date <= endDate
          );
          
          let overtimeHours = 0;
          let holidayPremium = 0;
          let holidayNote = '';
          
          const hourlyRate = (monthlySalary / 26) / 8;
          const overtimeHourlyRate = parseFloat(emp.overtimeHourlyRate) || hourlyRate;
          
          empShifts.forEach(shift => {
            overtimeHours += shift.overtimeHours || 0;
            
            // Calculate holiday premium if applicable
            if (shift.isHoliday && shift.holidayType) {
              const multiplier = shift.holidayType === 'regular' ? 1.0 : 
                                shift.holidayType === 'special_non_working' ? 0.3 : 0;
              const regHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
              holidayPremium += (regHours * hourlyRate) * multiplier;
            }
          });
          
          const holidayShifts = empShifts.filter(s => s.isHoliday);
          if (holidayShifts.length > 0) {
            const holidays = [...new Set(holidayShifts.map(s => s.holidayName))];
            holidayNote = holidays.join(', ');
          }
          
          const overtimePay = overtimeHours * overtimeHourlyRate;
          const totalAmount = monthlySalary + overtimePay + holidayPremium;
          
          let savedNotes = {};
          try {
            if (emp.payrollNotes) {
              savedNotes = typeof emp.payrollNotes === 'string' ? JSON.parse(emp.payrollNotes) : emp.payrollNotes;
            }
          } catch (e) { savedNotes = {}; }
          
          const noteKey = `monthly-${selectedMonth}`;
          const isPaidNote = savedNotes[noteKey] === 'PAID';
          
          return {
            id: emp.id,
            name: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.employeeId,
            department: emp.department || '-',
            rate: monthlySalary > 0 ? `${monthlySalary.toLocaleString()}/month` : '-',
            paymentDetails: emp.paymentDetails || emp.paymentMethod || '-',
            adjustments: '',
            amount: totalAmount,
            status: isPaidNote ? 'PAID' : 'UNPAID',
            note: savedNotes[noteKey] || holidayNote || (overtimeHours > 0 ? `${overtimeHours} OT hours` : '')
          };
        });
      
      setReportData({ hourly: hourlyEmployees, monthly: monthlyEmployees });
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMonth) {
      generateReport();
    }
  }, [selectedCycle, selectedMonth, selectedDepartment, employees, shifts]);

  const handleSaveNote = async (employeeId, note) => {
    try {
      const period = `${selectedCycle}-${selectedMonth}`;
      await savePayrollNote(employeeId, period, note);
      
      if (selectedCycle === 'first' || selectedCycle === 'second') {
        setReportData(prev => ({
          ...prev,
          hourly: prev.hourly.map(e => e.id === employeeId ? { ...e, note } : e)
        }));
      } else {
        setReportData(prev => ({
          ...prev,
          monthly: prev.monthly.map(e => e.id === employeeId ? { ...e, note } : e)
        }));
      }
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    }
    setEditingNote(null);
    setNoteText('');
  };

  const startEditNote = (employeeId, currentNote) => {
    setEditingNote(employeeId);
    setNoteText(currentNote || '');
  };

  const cycleInfo = getCycleDates(selectedCycle, selectedMonth);
  const displayData = selectedCycle === 'first' || selectedCycle === 'second' ? reportData.hourly : reportData.monthly;
  const isMonthly = selectedCycle === 'monthly';

  const totalAmount = displayData.reduce((sum, r) => sum + r.amount, 0);
  const totalDays = displayData.reduce((sum, r) => sum + r.days, 0);

  const deptList = departments && departments.length > 0 
    ? ['all', ...departments.map(d => d.name)]
    : ['all', ...new Set(employees.map(e => e.department).filter(Boolean))];

  const handleExportCSV = () => {
    let csv = '';
    
    csv += `${cycleInfo.label}\n`;
    csv += selectedDepartment !== 'all' ? `Department: ${selectedDepartment}\n` : '';
    
    if (isMonthly) {
      csv += `NAME,DEPARTMENT,MONTHLY RATE,GCASH NUMBER,ADJUSTMENTS,AMOUNT,STATUS,NOTE\n`;
    } else {
      csv += `NAME,DEPARTMENT,DAILY RATE,GCASH NUMBER,NUMBER OF DAYS,ADJUSTMENTS,AMOUNT,STATUS,NOTE\n`;
    }
    
    displayData.forEach(r => {
      if (isMonthly) {
        csv += `"${r.name}","${r.department}","${r.rate}","${r.paymentDetails}","${r.adjustments}","${r.amount.toFixed(2)}","${r.status}","${r.note}"\n`;
      } else {
        csv += `"${r.name}","${r.department}","${r.rate}","${r.paymentDetails}","${r.days}","${r.adjustments}","${r.amount.toFixed(2)}","${r.status}","${r.note}"\n`;
      }
    });
    
    csv += `TOTAL,,,"${isMonthly ? '' : totalDays}","","${totalAmount.toFixed(2)}",,\n`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${selectedCycle}-${selectedMonth}${selectedDepartment !== 'all' ? '-' + selectedDepartment : ''}.csv`;
    a.click();
  };

  const cycleButtons = [
    { key: 'first', label: '1st Half', desc: 'Days 1-15' },
    { key: 'second', label: '2nd Half', desc: 'Days 16-End' },
    { key: 'monthly', label: 'Monthly', desc: 'Full Month' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <RiMoneyDollarCircleLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Payroll Report</h2>
            <p className="text-sm text-slate-500">Generate and manage employee salaries</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generateReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <RiFileTextLine className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30"
          >
            <RiDownloadLine className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* Month Filter */}
          <div className="min-w-[180px]">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <RiCalendarLine className="w-4 h-4" />
              Period
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Department Filter */}
          <div className="min-w-[200px]">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <RiGroupLine className="w-4 h-4" />
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all bg-white"
            >
              <option value="all">All Departments</option>
              {deptList.filter(d => d !== 'all').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Pay Period Tabs */}
          <div className="flex-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <RiMoneyDollarCircleLine className="w-4 h-4" />
              Pay Period
            </label>
            <div className="flex gap-2">
              {cycleButtons.map(btn => (
                <button
                  key={btn.key}
                  onClick={() => setSelectedCycle(btn.key)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    selectedCycle === btn.key 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="font-medium">{btn.label}</div>
                  <div className={`text-xs ${selectedCycle === btn.key ? 'text-blue-100' : 'text-slate-400'}`}>{btn.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Total Employees</p>
          <p className="text-3xl font-bold text-blue-700">{displayData.length}</p>
          <p className="text-xs text-blue-400 mt-1">{isMonthly ? 'Monthly rate employees' : 'Hourly/Daily rate employees'}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
          <p className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-1">Paid</p>
          <p className="text-3xl font-bold text-green-700">{displayData.filter(d => d.status === 'PAID').length}</p>
          <p className="text-xs text-green-400 mt-1">{displayData.filter(d => d.status === 'PAID').length} employees already paid</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">Unpaid</p>
          <p className="text-3xl font-bold text-amber-700">{displayData.filter(d => d.status === 'UNPAID').length}</p>
          <p className="text-xs text-amber-400 mt-1">Employees pending payment</p>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800">{cycleInfo.label}</h3>
              <p className="text-sm text-slate-500">{cycleInfo.subtitle}</p>
            </div>
            {selectedDepartment !== 'all' && (
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                {selectedDepartment}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500">Generating report...</p>
          </div>
        ) : displayData.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RiFileTextLine className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No employees found for this period</p>
            <p className="text-sm text-slate-400 mt-1">Try changing the filters above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">NAME</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">DEPT</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">RATE</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">PAYMENT</th>
                  {!isMonthly && <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">DAYS</th>}
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">AMOUNT</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">STATUS</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">NOTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {row.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                        </div>
                        <span className="font-semibold text-slate-800">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                        {row.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{row.rate}</td>
                    <td className="px-6 py-4 text-slate-600">{row.paymentDetails}</td>
                    {!isMonthly && (
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm">
                          {row.days}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-green-600">
                        ₱{row.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold ${
                        row.status === 'PAID' 
                          ? 'bg-green-100 text-green-700' 
                          : row.status === 'UNPAID'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingNote === row.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-40"
                            placeholder="Add note..."
                            autoFocus
                          />
                          <button onClick={() => handleSaveNote(row.id, noteText)} className="text-green-600 hover:text-green-700 p-1">
                            <RiCheckboxCircleLine className="w-5 h-5" />
                          </button>
                          <button onClick={() => setEditingNote(null)} className="text-slate-400 hover:text-slate-600 p-1">
                            <RiCloseLine className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 max-w-[180px] truncate">{row.note || '-'}</span>
                          <button 
                            onClick={() => startEditNote(row.id, row.note)} 
                            className="text-slate-400 hover:text-blue-500 p-1 transition-colors"
                          >
                            <RiEditLine className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800" colSpan={isMonthly ? 5 : 6}>
                    TOTAL ({displayData.length} employees)
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xl font-bold text-green-700">
                      ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4" colSpan={isMonthly ? 1 : 1}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default PayrollReport;