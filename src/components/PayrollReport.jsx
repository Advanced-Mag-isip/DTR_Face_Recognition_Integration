import { useState, useEffect } from 'react';
import { RiFileTextLine, RiDownloadLine, RiCheckboxCircleLine, RiCloseLine, RiCalendarLine, RiGroupLine, RiMoneyDollarCircleLine, RiArrowDownSLine } from 'react-icons/ri';
import { savePayrollNote } from '../utils/usersApi';
import { calculateShiftPay } from '../utils/salaryCalculator';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

function PayrollReport({ employees, shifts, departments = [] }) {
  const [selectedCycle, setSelectedCycle] = useState('first');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [reportData, setReportData] = useState({ hourly: [], monthly: [] });
  const [loading, setLoading] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const openNotesModal = (notes, name, id) => {
    setSelectedNotes(notes || '');
    setSelectedEmployeeName(name);
    setSelectedEmployeeId(id);
    setShowNotesModal(true);
  };

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  }, []);

  const getFridaysInMonth = (year, monthNum) => {
    const fridays = [];
    const lastDay = new Date(year, monthNum, 0).getDate();
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, monthNum - 1, day);
      if (date.getDay() === 5) { // Friday = 5
        fridays.push(new Date(date));
      }
    }
    return fridays;
  };

  const isMonthlyAmountHidden = (monthStr) => {
    if (!monthStr) return false;
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    
    const [targetYear, targetMonth] = monthStr.split('-').map(Number);
    const fridays = getFridaysInMonth(targetYear, targetMonth);
    if (fridays.length === 0) return false;

    const lastFriday = fridays[fridays.length - 1];
    const paymentDate = new Date(lastFriday);
    
    const visibilityDate = new Date(paymentDate);
    visibilityDate.setDate(paymentDate.getDate() - 1);
    visibilityDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isFutureMonth = targetYear > currentYear || (targetYear === currentYear && targetMonth > currentMonthNum);
    
    return isFutureMonth || today < visibilityDate;
  };

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
    const fridays = getFridaysInMonth(year, monthNum);

    const getLastFridayOfPrevMonth = (y, m) => {
      const d = new Date(y, m - 1, 0);
      while (d.getDay() !== 5) {
        d.setDate(d.getDate() - 1);
      }
      return new Date(d);
    };
    
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    if (cycle === 'first') {
      const prevLastFriday = getLastFridayOfPrevMonth(year, monthNum);
      const startDate = new Date(prevLastFriday);
      startDate.setDate(startDate.getDate() + 1);
      const secondFriday = fridays[1] || fridays[0];
      
      return {
        label: `PAYROLL (FIRST HALF)`,
        subtitle: `${startDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} - ${secondFriday ? secondFriday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '2nd Friday'}`,
        startDate: formatDate(startDate),
        endDate: secondFriday ? formatDate(secondFriday) : formatDate(new Date(year, monthNum - 1, 15))
      };
    } else {
      const secondFriday = fridays[1] || fridays[0];
      const startDate = new Date(secondFriday);
      startDate.setDate(startDate.getDate() + 1);
      const lastFriday = fridays[fridays.length - 1] || fridays[0];
      
      return {
        label: `PAYROLL (SECOND HALF)`,
        subtitle: `${startDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })} - ${lastFriday ? lastFriday.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Last Friday'}`,
        startDate: formatDate(startDate),
        endDate: lastFriday ? formatDate(lastFriday) : formatDate(monthEnd)
      };
    }
  };

  const generateReport = () => {
    setLoading(true);
    
    try {
      const dates = getCycleDates(selectedCycle, selectedMonth);
      const startDate = dates.startDate;
      const endDate = dates.endDate;
      const shouldHideMonthly = isMonthlyAmountHidden(selectedMonth);
      
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
          const effectiveHourlyRate = hourlyRate > 0 ? hourlyRate : (dailySalary / 8);
          const overtimeHourlyRate = parseFloat(emp.overtimeHourlyRate) || (effectiveHourlyRate * 1.25);
          
          const daysWorked = empShifts.length;
          const paidShifts = empShifts.filter(s => s.isPaid);
          const unpaidShifts = empShifts.filter(s => !s.isPaid);
          
          let unpaidAmount = 0;
          let paidAmount = 0;
          let overtimeHours = 0;
          
          const holidayShifts = empShifts.filter(s => s.isHoliday);
          let holidayNote = '';
          if (holidayShifts.length > 0) {
            const regularHolidays = holidayShifts.filter(s => s.holidayType === 'regular');
            const specialHolidays = holidayShifts.filter(s => s.holidayType === 'special_non_working');
            
            const holidayParts = [];
            if (regularHolidays.length > 0) {
              const names = [...new Set(regularHolidays.map(s => s.holidayName))].join(', ');
              holidayParts.push(`${regularHolidays.length} Regular Holiday${regularHolidays.length > 1 ? 's' : ''} (${names})`);
            }
            if (specialHolidays.length > 0) {
              const names = [...new Set(specialHolidays.map(s => s.holidayName))].join(', ');
              holidayParts.push(`${specialHolidays.length} Special Non-working Holiday${specialHolidays.length > 1 ? 's' : ''} (${names})`);
            }
            holidayNote = holidayParts.join(', ');
          }
          
          unpaidShifts.forEach(shift => {
            overtimeHours += shift.overtimeHours || 0;
            unpaidAmount += calculateShiftPay(shift, effectiveHourlyRate, overtimeHourlyRate);
          });

          paidShifts.forEach(shift => {
            paidAmount += calculateShiftPay(shift, effectiveHourlyRate, overtimeHourlyRate);
          });

          const totalGross = parseFloat((unpaidAmount + paidAmount).toFixed(2));
          
          const daysStr = overtimeHours > 0 
            ? `${daysWorked} day${daysWorked !== 1 ? 's' : ''} and ${overtimeHours} hr${overtimeHours !== 1 ? 's' : ''}` 
            : `${daysWorked} day${daysWorked !== 1 ? 's' : ''}`;

          return {
            id: emp.id,
            name: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.employeeId,
            position: emp.position || '-',
            department: emp.department || '-',
            rate: hourlyRate > 0 ? `${hourlyRate}/hr` : (dailySalary > 0 ? `${dailySalary}/day` : '-'),
            paymentDetails: `${emp.paymentMethod?.toUpperCase().replace('_', ' ') || 'GCASH'}: ${emp.paymentDetails || '-'}`,
            days: daysStr,
            amount: totalGross,
            paidAmount: parseFloat(paidAmount.toFixed(2)),
            unpaidAmount: parseFloat(unpaidAmount.toFixed(2)),
            status: (unpaidShifts.length === 0 && daysWorked > 0) ? 'PAID' : 
                    (paidShifts.length > 0 && unpaidShifts.length > 0) ? 'PARTIAL' :
                    unpaidShifts.length > 0 ? 'UNPAID' : '-',
            note: (() => {
              let savedNotes = {};
              try {
                if (emp.payrollNotes) {
                  savedNotes = typeof emp.payrollNotes === 'string' ? JSON.parse(emp.payrollNotes) : emp.payrollNotes;
                }
              } catch (e) { savedNotes = {}; }
              return savedNotes[`${selectedCycle}-${selectedMonth}`] || holidayNote;
            })()
          };
        })
        .filter(r => parseInt(r.days) > 0);

      const monthlyEmployees = filteredEmployees
        .filter(emp => emp.isActive !== false && emp.paymentType === 'monthly')
        .map(emp => {
          const monthlySalary = parseFloat(emp.monthlySalary) || 0;
          if (selectedCycle === 'first') return null;

          const empShifts = shifts.filter(s => s.employeeId === emp.id && s.date <= endDate);
          const paidShifts = empShifts.filter(s => s.isPaid);
          const unpaidShifts = empShifts.filter(s => !s.isPaid);
          
          let overtimeHours = 0;
          let holidayPremium = 0;
          let regHolidayList = [];
          let specHolidayList = [];
          
          const hourlyRate = (monthlySalary / 26) / 8;
          const overtimeHourlyRate = parseFloat(emp.overtimeHourlyRate) || hourlyRate;
          
          empShifts.forEach(shift => {
            overtimeHours += shift.overtimeHours || 0;
            if (shift.isHoliday && shift.holidayType) {
              const multiplier = shift.holidayType === 'regular' ? 1.0 : 
                                shift.holidayType === 'special_non_working' ? 0.3 : 0;
              const regHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
              holidayPremium += (regHours * hourlyRate) * multiplier;
              if (shift.holidayType === 'regular') regHolidayList.push(shift.holidayName);
              else if (shift.holidayType === 'special_non_working') specHolidayList.push(shift.holidayName);
            }
          });

          const holidayParts = [];
          if (regHolidayList.length > 0) {
            const names = [...new Set(regHolidayList)].join(', ');
            holidayParts.push(`${regHolidayList.length} Regular Holiday${regHolidayList.length > 1 ? 's' : ''} (${names})`);
          }
          if (specHolidayList.length > 0) {
            const names = [...new Set(specHolidayList)].join(', ');
            holidayParts.push(`${specHolidayList.length} Special Non-working Holiday${specHolidayList.length > 1 ? 's' : ''} (${names})`);
          }
          const holidayNote = holidayParts.join(', ');
          
          const overtimePay = overtimeHours * overtimeHourlyRate;
          const totalGross = parseFloat((monthlySalary + overtimePay + holidayPremium).toFixed(2));
          
          let savedNotes = {};
          try {
            if (emp.payrollNotes) {
              savedNotes = typeof emp.payrollNotes === 'string' ? JSON.parse(emp.payrollNotes) : emp.payrollNotes;
            }
          } catch (e) { savedNotes = {}; }
          
          const noteKey = `${selectedCycle}-${selectedMonth}`;
          const isFullPaid = savedNotes[noteKey] === 'PAID' || (empShifts.length > 0 && empShifts.every(s => s.isPaid));
          const someShiftsPaid = empShifts.some(s => s.isPaid);
          const isAmountHidden = shouldHideMonthly && !isFullPaid && (totalGross > 0);

          return {
            id: emp.id,
            name: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.employeeId,
            position: emp.position || '-',
            department: emp.department || '-',
            rate: `${monthlySalary.toLocaleString()}/month`,
            paymentDetails: `${emp.paymentMethod?.toUpperCase().replace('_', ' ') || 'GCASH'}: ${emp.paymentDetails || '-'}`,
            amount: totalGross,
            paidAmount: isFullPaid ? totalGross : 0,
            unpaidAmount: isFullPaid ? 0 : totalGross,
            status: isFullPaid ? 'PAID' : (someShiftsPaid ? 'PARTIAL' : 'UNPAID'),
            isAmountHidden,
            days: `${empShifts.length} days`,
            note: savedNotes[noteKey] || holidayNote
          };
        }).filter(Boolean);
      
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
    setIsSaving(true);
    try {
      const period = `${selectedCycle}-${selectedMonth}`;
      await savePayrollNote(employeeId, period, note);
      generateReport();
      setShowNotesModal(false);
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const cycleInfo = getCycleDates(selectedCycle, selectedMonth);
  const displayData = selectedCycle === 'first' 
    ? reportData.hourly 
    : [...reportData.hourly, ...reportData.monthly];

  const totalAmount = parseFloat(displayData.reduce((sum, r) => sum + r.amount, 0).toFixed(2));

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Report');
    
    // Standard columns
    const columns = [
      { header: 'NAME', key: 'name', width: 25 },
      { header: 'POSITION', key: 'position', width: 20 },
      { header: 'DEPARTMENT', key: 'department', width: 15 },
      { header: 'RATE', key: 'rate', width: 15 },
      { header: 'PAYMENT DETAILS', key: 'paymentDetails', width: 30 },
      { header: 'DAYS', key: 'days', width: 15 },
      { header: 'AMOUNT', key: 'amount', width: 15 },
      { header: 'STATUS', key: 'status', width: 20 },
      { header: 'NOTE', key: 'note', width: 30 }
    ];

    worksheet.columns = columns;

    const deptsToExport = selectedDepartment === 'all' 
      ? deptList.filter(d => d !== 'all') 
      : [selectedDepartment];

    let currentRow = 1;

    // Helper to get data for a specific cycle and department
    const getTableData = (cycle, dept) => {
      const dates = getCycleDates(cycle, selectedMonth);
      const startDate = dates.startDate;
      const endDate = dates.endDate;
      const shouldHideMonthly = isMonthlyAmountHidden(selectedMonth);
      
      const deptEmployees = employees.filter(emp => emp.department === dept);
      
      const hourlyData = deptEmployees
        .filter(emp => emp.isActive !== false && (emp.paymentType === 'hourly' || !emp.paymentType))
        .map(emp => {
          const empShifts = shifts.filter(s => 
            s.employeeId === emp.id && 
            s.date >= startDate &&
            s.date <= endDate
          );
          const dailySalary = parseFloat(emp.dailySalary) || 0;
          const hourlyRate = parseFloat(emp.hourlyRate) || 0;
          const effectiveHourlyRate = hourlyRate > 0 ? hourlyRate : (dailySalary / 8);
          const overtimeHourlyRate = parseFloat(emp.overtimeHourlyRate) || (effectiveHourlyRate * 1.25);
          
          const daysWorked = empShifts.length;
          const unpaidShifts = empShifts.filter(s => !s.isPaid);
          const paidShifts = empShifts.filter(s => s.isPaid);
          
          let unpaidAmount = 0;
          let paidAmount = 0;
          let overtimeHours = 0;
          
          unpaidShifts.forEach(shift => {
            overtimeHours += shift.overtimeHours || 0;
            unpaidAmount += calculateShiftPay(shift, effectiveHourlyRate, overtimeHourlyRate);
          });

          paidShifts.forEach(shift => {
            paidAmount += calculateShiftPay(shift, effectiveHourlyRate, overtimeHourlyRate);
          });

          const totalGross = parseFloat((unpaidAmount + paidAmount).toFixed(2));

          const daysStr = overtimeHours > 0 
            ? `${daysWorked} day${daysWorked !== 1 ? 's' : ''} and ${overtimeHours} hr${overtimeHours !== 1 ? 's' : ''}` 
            : `${daysWorked} day${daysWorked !== 1 ? 's' : ''}`;

          // Holiday logic for notes
          const holidayShifts = empShifts.filter(s => s.isHoliday);
          let holidayNote = '';
          if (holidayShifts.length > 0) {
            const regNames = [...new Set(holidayShifts.filter(s => s.holidayType === 'regular').map(s => s.holidayName))].join(', ');
            const specNames = [...new Set(holidayShifts.filter(s => s.holidayType === 'special_non_working').map(s => s.holidayName))].join(', ');
            holidayNote = [regNames ? `Reg: ${regNames}` : '', specNames ? `Spec: ${specNames}` : ''].filter(Boolean).join(' | ');
          }

          const status = (unpaidShifts.length === 0 && daysWorked > 0) ? 'PAID' : 
                         (paidShifts.length > 0 && unpaidShifts.length > 0) ? `PARTIAL (₱${unpaidAmount.toLocaleString()} left)` :
                         unpaidShifts.length > 0 ? 'UNPAID' : '-';

          return {
            name: `${emp.firstName} ${emp.lastName}`,
            position: emp.position || '-',
            department: emp.department || '-',
            rate: hourlyRate > 0 ? `${hourlyRate}/hr` : (dailySalary > 0 ? `${dailySalary}/day` : '-'),
            paymentDetails: `${emp.paymentMethod?.toUpperCase().replace('_', ' ') || 'GCASH'}: ${emp.paymentDetails || '-'}`,
            days: daysStr,
            amount: totalGross,
            status: status,
            note: (() => {
              let savedNotes = {};
              try { if (emp.payrollNotes) savedNotes = typeof emp.payrollNotes === 'string' ? JSON.parse(emp.payrollNotes) : emp.payrollNotes; } catch (e) {}
              return savedNotes[`${cycle}-${selectedMonth}`] || holidayNote;
            })()
          };
        })
        .filter(r => parseInt(r.days) > 0);

      const monthlyData = cycle === 'first' ? [] : deptEmployees
        .filter(emp => emp.isActive !== false && emp.paymentType === 'monthly')
        .map(emp => {
          const monthlySalary = parseFloat(emp.monthlySalary) || 0;
          const empShifts = shifts.filter(s => s.employeeId === emp.id && s.date <= endDate);
          const hourlyRate = (monthlySalary / 26) / 8;
          let overtimeHours = 0;
          let holidayPremium = 0;
          
          empShifts.forEach(shift => {
            overtimeHours += shift.overtimeHours || 0;
            if (shift.isHoliday) {
              const multiplier = shift.holidayType === 'regular' ? 1.0 : shift.holidayType === 'special_non_working' ? 0.3 : 0;
              holidayPremium += ((shift.morningHours || 0) + (shift.afternoonHours || 0)) * hourlyRate * multiplier;
            }
          });

          const totalGross = parseFloat((monthlySalary + (overtimeHours * (emp.overtimeHourlyRate || hourlyRate)) + holidayPremium).toFixed(2));
          let savedNotes = {};
          try { if (emp.payrollNotes) savedNotes = typeof emp.payrollNotes === 'string' ? JSON.parse(emp.payrollNotes) : emp.payrollNotes; } catch (e) {}
          const isPaid = savedNotes[`${cycle}-${selectedMonth}`] === 'PAID' || (empShifts.length > 0 && empShifts.every(s => s.isPaid));

          return {
            name: `${emp.firstName} ${emp.lastName}`,
            position: emp.position || '-',
            department: emp.department || '-',
            rate: `${monthlySalary.toLocaleString()}/month`,
            paymentDetails: `${emp.paymentMethod?.toUpperCase().replace('_', ' ') || 'GCASH'}: ${emp.paymentDetails || '-'}`,
            days: `${empShifts.length} days`,
            amount: totalGross,
            status: isPaid ? 'PAID' : (empShifts.some(s => s.isPaid) ? 'PARTIAL' : 'UNPAID'),
            note: savedNotes[`${cycle}-${selectedMonth}`] || ''
          };
        });

      return [...hourlyData, ...monthlyData];
    };

    for (const dept of deptsToExport) {
      const firstHalfData = getTableData('first', dept);
      const secondHalfData = getTableData('second', dept);

      // Special Case: If only second half has data, it might be a Monthly-only department
      if (firstHalfData.length === 0 && secondHalfData.length > 0) {
        addTableToSheet(worksheet, secondHalfData, `PAYROLL - ${dept.toUpperCase()}`);
        worksheet.addRow([]); worksheet.addRow([]); // 2 rows separation
      } else {
        if (firstHalfData.length > 0) {
          addTableToSheet(worksheet, firstHalfData, `PAYROLL (FIRST HALF) - ${dept.toUpperCase()}`);
          worksheet.addRow([]); worksheet.addRow([]);
        }
        if (secondHalfData.length > 0) {
          addTableToSheet(worksheet, secondHalfData, `PAYROLL (SECOND HALF) - ${dept.toUpperCase()}`);
          worksheet.addRow([]); worksheet.addRow([]);
        }
      }
    }

    function addTableToSheet(ws, data, title) {
      const startRow = ws.lastRow ? ws.lastRow.number + 1 : 1;
      
      // Title Row
      const titleRow = ws.addRow([title]);
      ws.mergeCells(titleRow.number, 1, titleRow.number, 9);
      titleRow.font = { bold: true };
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
      titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } };

      // Header Row
      const headerRow = ws.addRow(columns.map(c => c.header));
      headerRow.font = { bold: true };
      headerRow.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      });

      // Data Rows
      data.forEach(r => {
        const row = ws.addRow([r.name, r.position, r.department, r.rate, r.paymentDetails, r.days, r.amount, r.status, r.note]);
        row.eachCell((cell, colNumber) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
          
          if (colNumber === 7) { // Amount column
            cell.numFmt = '\"₱\"#,##0.00';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' } }; // Light Green
          }
          if (colNumber === 8) { // Status column
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } }; // Light Yellow
          }
        });
      });

      // Total Row
      const totalAmount = data.reduce((sum, r) => sum + r.amount, 0);
      const totalRow = ws.addRow([]);
      ws.mergeCells(totalRow.number, 1, totalRow.number, 6);
      totalRow.getCell(1).value = `TOTAL (${data.length} EMPLOYEES)`;
      totalRow.getCell(7).value = totalAmount;
      
      // Style Total Row (Columns 1-9)
      for (let i = 1; i <= 9; i++) {
        const cell = totalRow.getCell(i);
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' } };
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        if (i === 7) cell.numFmt = '\"₱\"#,##0.00';
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `payroll-report-${selectedMonth}.xlsx`);
  };

  const cycleButtons = [
    { key: 'first', label: '1st Half', desc: '1st - 2nd Friday' },
    { key: 'second', label: '2nd Half', desc: 'Post 2nd Friday + Monthly' }
  ];

  const deptList = departments && departments.length > 0 
    ? ['all', ...departments.map(d => d.name)]
    : ['all', ...new Set(employees.map(e => e.department).filter(Boolean))];

  return (
    <div className="space-y-6">
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
          <button onClick={generateReport} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm">
            <RiFileTextLine className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:from-green-600 transition-all shadow-lg">
            <RiDownloadLine className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px]">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <RiCalendarLine className="w-4 h-4" /> Period
            </label>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/50 outline-none" />
          </div>

          <div className="min-w-[200px]">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <RiGroupLine className="w-4 h-4" /> Department
            </label>
            <div className="relative">
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="appearance-none w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 text-slate-800 font-medium outline-none bg-white">
                <option value="all">All Departments</option>
                {deptList.filter(d => d !== 'all').map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              <RiArrowDownSLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <RiMoneyDollarCircleLine className="w-4 h-4" /> Pay Period
            </label>
            <div className="flex gap-2">
              {cycleButtons.map(btn => (
                <button key={btn.key} onClick={() => setSelectedCycle(btn.key)} className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${selectedCycle === btn.key ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <div>{btn.label}</div>
                  <div className={`text-xs ${selectedCycle === btn.key ? 'text-blue-100' : 'text-slate-400'}`}>{btn.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">{cycleInfo.label}</h3>
          <p className="text-sm text-slate-500">{cycleInfo.subtitle}</p>
        </div>

        {loading ? (
          <div className="p-16 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div><p className="text-slate-500">Generating report...</p></div>
        ) : displayData.length === 0 ? (
          <div className="p-16 text-center"><RiFileTextLine className="w-16 h-16 text-slate-200 mx-auto mb-4" /><p className="text-slate-500 font-medium">No employees found for this period</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">NAME</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">POSITION</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">DEPT</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">RATE</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">PAYMENT METHOD & DETAILS</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">DAYS</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">AMOUNT</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">STATUS</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">NOTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{row.position}</td>
                    <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">{row.department}</span></td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{row.rate}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">{row.paymentDetails}</td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600 font-medium">{row.days}</td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex flex-col items-start">
                        <span className={`text-lg font-bold ${row.isAmountHidden ? 'text-slate-400' : 'text-green-600'}`}>{row.isAmountHidden ? '₱ --.--' : `₱${row.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}</span>
                        {(row.status === 'PARTIAL' || row.status === 'PAID') && row.paidAmount > 0 && row.unpaidAmount > 0 && <span className="text-[10px] text-slate-400 font-medium">Remaining: ₱{row.unpaidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center"><span className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${row.status === 'PAID' ? 'bg-green-100 text-green-700' : row.status === 'PARTIAL' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {row.isAmountHidden && row.status === 'UNPAID' ? 'PENDING' : 
                       (row.status === 'PARTIAL' ? `PARTIAL (₱${row.unpaidAmount.toLocaleString()} left)` : row.status)}
                    </span></td>
                    <td className="px-6 py-4"><button onClick={() => openNotesModal(row.note, row.name, row.id)} className="text-sm text-slate-500 max-w-[180px] truncate hover:text-blue-600 text-left">{row.note || '-'}</button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100">
                  <td className="px-6 py-4 font-bold text-slate-800" colSpan={6}>TOTAL ({displayData.length} employees)</td>
                  <td className="px-6 py-4 text-left font-bold text-green-700 text-xl">₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowNotesModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-800">Payroll Note</h3><button onClick={() => setShowNotesModal(false)}><RiCloseLine className="w-6 h-6" /></button></div>
            <textarea value={selectedNotes} onChange={e => setSelectedNotes(e.target.value)} className="w-full border rounded-lg p-3 text-sm min-h-[150px] outline-none" placeholder="Type note here..." />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowNotesModal(false)} className="flex-1 bg-slate-100 py-3 rounded-xl font-semibold">Cancel</button>
              <button onClick={() => handleSaveNote(selectedEmployeeId, selectedNotes)} disabled={isSaving} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollReport;
