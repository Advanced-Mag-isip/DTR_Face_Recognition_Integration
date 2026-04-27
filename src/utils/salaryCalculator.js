/**
 * Salary Calculation Utilities
 * Shared functions for calculating shift salaries across components
 */

/**
 * Calculate the pay for a single shift
 * @param {Object} shift - Shift object with morningHours, afternoonHours, overtimeHours, isHoliday, holidayType
 * @param {number} hourlyRate - Employee's hourly rate
 * @param {number} overtimeHourlyRate - Optional overtime rate (defaults to hourlyRate)
 * @returns {number} Total pay for the shift (rounded to 2 decimal places)
 */
export const calculateShiftPay = (shift, hourlyRate, overtimeHourlyRate = null) => {
  const otRate = overtimeHourlyRate || hourlyRate;
  
  const regHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
  const otHours = shift.overtimeHours || 0;
  
  let shiftPay = (regHours * hourlyRate) + (otHours * otRate);
  
  if (shift.isHoliday && shift.holidayType === 'regular') {
    shiftPay += regHours * hourlyRate;
  } else if (shift.isHoliday && shift.holidayType === 'special_non_working') {
    shiftPay += regHours * hourlyRate * 0.3;
  }
  
  return parseFloat(shiftPay.toFixed(2));
};

/**
 * Calculate total salary from multiple shifts
 * @param {Array} shifts - Array of shift objects
 * @param {number} hourlyRate - Employee's hourly rate
 * @param {number} overtimeHourlyRate - Optional overtime rate
 * @param {Function} filterFn - Optional filter function to include/exclude shifts
 * @returns {Object} { total, paid, unpaid }
 */
export const calculateShiftsSalary = (shifts, hourlyRate, overtimeHourlyRate = null, filterFn = null) => {
  const otRate = overtimeHourlyRate || hourlyRate;
  
  let total = 0;
  let paid = 0;
  let unpaid = 0;
  
  const filteredShifts = filterFn ? shifts.filter(filterFn) : shifts;
  
  filteredShifts.forEach(shift => {
    const shiftPay = calculateShiftPay(shift, hourlyRate, otRate);
    total += shiftPay;
    
    if (shift.isPaid) {
      paid += shiftPay;
    } else {
      unpaid += shiftPay;
    }
  });
  
  return {
    total: parseFloat(total.toFixed(2)),
    paid: parseFloat(paid.toFixed(2)),
    unpaid: parseFloat(unpaid.toFixed(2)),
    shiftCount: filteredShifts.length
  };
};

/**
 * Calculate holiday premium amount for a shift
 * @param {Object} shift - Shift object with morningHours, afternoonHours, isHoliday, holidayType
 * @param {number} hourlyRate - Employee's hourly rate
 * @returns {number} Holiday premium amount
 */
export const calculateHolidayPremium = (shift, hourlyRate) => {
  const regHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
  const basePay = regHours * hourlyRate;
  
  if (shift.isHoliday && shift.holidayType === 'regular') {
    return parseFloat((basePay).toFixed(2));
  } else if (shift.isHoliday && shift.holidayType === 'special_non_working') {
    return parseFloat((basePay * 0.3).toFixed(2));
  }
  
  return 0;
};