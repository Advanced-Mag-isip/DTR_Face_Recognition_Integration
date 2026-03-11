/**
 * Working hours per month (8 hours/day × 22 working days)
 */
const WORKING_HOURS_PER_MONTH = 176;

/**
 * Derive hourly rate from monthly salary
 * @param {number} monthlySalary - The employee's monthly salary
 * @returns {number} Hourly rate
 */
const deriveHourlyRate = (monthlySalary) => {
  if (!monthlySalary || monthlySalary <= 0) return 0;
  return monthlySalary / WORKING_HOURS_PER_MONTH;
};

/**
 * Calculate salary for a single shift
 * @param {Object} shift - Shift object with morningHours, afternoonHours, overtimeHours
 * @param {number} monthlySalary - Employee's monthly salary
 * @param {number} overtimeHourlyRate - Optional overtime hourly rate (auto-calculated if not provided)
 * @returns {Object} Salary breakdown for the shift
 */
const calculateShiftSalary = (shift, monthlySalary, overtimeHourlyRate) => {
  const hourlyRate = deriveHourlyRate(monthlySalary);
  // Overtime rate equals regular hourly rate (1:1)
  const otRate = overtimeHourlyRate && overtimeHourlyRate > 0 
    ? overtimeHourlyRate 
    : hourlyRate;
  
  const regularHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
  const overtimeHours = shift.overtimeHours || 0;
  
  // Regular hours are covered by monthly salary
  // Only overtime is paid extra
  const overtimePay = overtimeHours * otRate;
  
  return {
    regularHours,
    overtimeHours,
    hourlyRate: parseFloat(hourlyRate.toFixed(2)),
    overtimeRate: parseFloat(otRate.toFixed(2)),
    overtimePay: parseFloat(overtimePay.toFixed(2)),
    totalPay: parseFloat(overtimePay.toFixed(2)) // Only overtime is extra; base salary is fixed
  };
};

/**
 * Calculate monthly salary with overtime for a period
 * @param {Array} shifts - Array of shift objects
 * @param {number} monthlySalary - Employee's monthly salary
 * @param {number} overtimeHourlyRate - Optional overtime hourly rate
 * @returns {Object} Complete salary breakdown
 */
const calculateMonthlySalary = (shifts, monthlySalary, overtimeHourlyRate) => {
  const hourlyRate = deriveHourlyRate(monthlySalary);
  // Overtime rate equals regular hourly rate (1:1)
  const otRate = overtimeHourlyRate && overtimeHourlyRate > 0 
    ? overtimeHourlyRate 
    : hourlyRate;
  
  let totalRegularHours = 0;
  let totalOvertimeHours = 0;
  
  shifts.forEach(shift => {
    totalRegularHours += (shift.morningHours || 0) + (shift.afternoonHours || 0);
    totalOvertimeHours += shift.overtimeHours || 0;
  });
  
  const overtimePay = totalOvertimeHours * otRate;
  
  return {
    baseSalary: parseFloat(monthlySalary.toFixed(2)),
    totalRegularHours: parseFloat(totalRegularHours.toFixed(2)),
    totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
    hourlyRate: parseFloat(hourlyRate.toFixed(2)),
    overtimeRate: parseFloat(otRate.toFixed(2)),
    overtimePay: parseFloat(overtimePay.toFixed(2)),
    grossPay: parseFloat((monthlySalary + overtimePay).toFixed(2))
  };
};

module.exports = { 
  calculateShiftSalary, 
  calculateMonthlySalary, 
  deriveHourlyRate,
  WORKING_HOURS_PER_MONTH 
};
