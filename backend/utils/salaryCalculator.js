/**
 * Working hours per day (8 hours/day)
 */
const WORKING_HOURS_PER_DAY = 8;

/**
 * Holiday pay multipliers
 */
const HOLIDAY_MULTIPLIERS = {
  regular: 2.0,           // Double pay (100% extra)
  special_non_working: 1.3, // 30% extra pay
  special_working: 1.0,   // No extra pay (normal rate)
  null: 1.0,              // Normal day (no holiday)
  undefined: 1.0          // Normal day (no holiday)
};

/**
 * Get holiday multiplier based on holiday type
 * @param {string|null} holidayType - The type of holiday
 * @returns {number} Multiplier value
 */
const getHolidayMultiplier = (holidayType) => {
  return HOLIDAY_MULTIPLIERS[holidayType] || 1.0;
};

/**
 * Derive hourly rate from daily salary
 * @param {number} dailySalary - The employee's daily salary
 * @returns {number} Hourly rate
 */
const deriveHourlyRate = (dailySalary) => {
  if (!dailySalary || dailySalary <= 0) return 0;
  return dailySalary / WORKING_HOURS_PER_DAY;
};

/**
 * Calculate salary for a single shift with holiday consideration
 * @param {Object} shift - Shift object with morningHours, afternoonHours, overtimeHours, holidayType
 * @param {number} dailySalary - Employee's daily salary
 * @param {number} overtimeHourlyRate - Optional overtime hourly rate (auto-calculated if not provided)
 * @returns {Object} Salary breakdown for the shift
 */
const calculateShiftSalary = (shift, dailySalary, overtimeHourlyRate) => {
  const hourlyRate = deriveHourlyRate(dailySalary);
  // Overtime rate equals regular hourly rate (1:1)
  const otRate = overtimeHourlyRate && overtimeHourlyRate > 0
    ? overtimeHourlyRate
    : hourlyRate;

  const regularHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
  const overtimeHours = shift.overtimeHours || 0;

  // Get holiday multiplier
  const holidayMultiplier = getHolidayMultiplier(shift.holidayType);
  
  // Calculate base pay for regular hours
  const baseRegularPay = regularHours * hourlyRate;
  
  // Calculate holiday premium (extra pay portion)
  const holidayPremium = baseRegularPay * (holidayMultiplier - 1);
  
  // Total regular pay includes base + holiday premium
  const regularPay = baseRegularPay + holidayPremium;
  
  // Overtime pay (note: OT on holidays could have separate multiplier in future)
  const overtimePay = overtimeHours * otRate;

  return {
    regularHours,
    overtimeHours,
    hourlyRate: parseFloat(hourlyRate.toFixed(2)),
    overtimeRate: parseFloat(otRate.toFixed(2)),
    holidayMultiplier: parseFloat(holidayMultiplier.toFixed(2)),
    baseRegularPay: parseFloat(baseRegularPay.toFixed(2)),
    holidayPremium: parseFloat(holidayPremium.toFixed(2)),
    regularPay: parseFloat(regularPay.toFixed(2)),
    overtimePay: parseFloat(overtimePay.toFixed(2)),
    totalPay: parseFloat((regularPay + overtimePay).toFixed(2)),
    holidayType: shift.holidayType,
    holidayName: shift.holidayName,
    isHoliday: shift.isHoliday || false
  };
};

/**
 * Calculate salary based on actual days worked with holiday breakdown
 * @param {Array} shifts - Array of shift objects
 * @param {number} dailySalary - Employee's daily salary
 * @param {number} overtimeHourlyRate - Optional overtime hourly rate
 * @returns {Object} Complete salary breakdown with holiday categories
 */
const calculateMonthlySalary = (shifts, dailySalary, overtimeHourlyRate) => {
  const hourlyRate = deriveHourlyRate(dailySalary);
  // Overtime rate equals regular hourly rate (1:1)
  const otRate = overtimeHourlyRate && overtimeHourlyRate > 0
    ? overtimeHourlyRate
    : hourlyRate;

  let totalRegularHours = 0;
  let totalOvertimeHours = 0;
  const uniqueWorkDays = new Set();

  // Group shifts by holiday type
  const shiftsByHolidayType = {
    regular: [],
    special_non_working: [],
    special_working: [],
    normal: []
  };

  shifts.forEach(shift => {
    totalRegularHours += (shift.morningHours || 0) + (shift.afternoonHours || 0);
    totalOvertimeHours += shift.overtimeHours || 0;
    if (shift.date) {
      uniqueWorkDays.add(shift.date);
    }

    // Categorize by holiday type
    if (shift.holidayType === 'regular') {
      shiftsByHolidayType.regular.push(shift);
    } else if (shift.holidayType === 'special_non_working') {
      shiftsByHolidayType.special_non_working.push(shift);
    } else if (shift.holidayType === 'special_working') {
      shiftsByHolidayType.special_working.push(shift);
    } else {
      shiftsByHolidayType.normal.push(shift);
    }
  });

  // Calculate pay for each category
  const calculateCategoryPay = (categoryShifts, multiplier) => {
    let categoryRegularHours = 0;
    let categoryOvertimeHours = 0;
    const categoryDays = new Set();

    categoryShifts.forEach(shift => {
      categoryRegularHours += (shift.morningHours || 0) + (shift.afternoonHours || 0);
      categoryOvertimeHours += shift.overtimeHours || 0;
      if (shift.date) {
        categoryDays.add(shift.date);
      }
    });

    const basePay = categoryRegularHours * hourlyRate;
    const holidayPremium = basePay * (multiplier - 1);
    const regularPay = basePay + holidayPremium;
    const overtimePay = categoryOvertimeHours * otRate;

    return {
      daysWorked: categoryDays.size,
      regularHours: parseFloat(categoryRegularHours.toFixed(2)),
      overtimeHours: parseFloat(categoryOvertimeHours.toFixed(2)),
      basePay: parseFloat(basePay.toFixed(2)),
      holidayPremium: parseFloat(holidayPremium.toFixed(2)),
      regularPay: parseFloat(regularPay.toFixed(2)),
      overtimePay: parseFloat(overtimePay.toFixed(2)),
      totalPay: parseFloat((regularPay + overtimePay).toFixed(2))
    };
  };

  const normalPay = calculateCategoryPay(shiftsByHolidayType.normal, 1.0);
  const regularHolidayPay = calculateCategoryPay(shiftsByHolidayType.regular, 2.0);
  const specialNonWorkingPay = calculateCategoryPay(shiftsByHolidayType.special_non_working, 1.3);
  const specialWorkingPay = calculateCategoryPay(shiftsByHolidayType.special_working, 1.0);

  // Calculate totals
  const daysWorked = uniqueWorkDays.size;
  const totalBasePay = normalPay.basePay + regularHolidayPay.basePay + 
                       specialNonWorkingPay.basePay + specialWorkingPay.basePay;
  const totalHolidayPremium = regularHolidayPay.holidayPremium + specialNonWorkingPay.holidayPremium;
  const totalOvertimePay = normalPay.overtimePay + regularHolidayPay.overtimePay + 
                           specialNonWorkingPay.overtimePay + specialWorkingPay.overtimePay;
  const grossPay = totalBasePay + totalHolidayPremium + totalOvertimePay;

  return {
    baseSalary: parseFloat(totalBasePay.toFixed(2)),
    totalHolidayPremium: parseFloat(totalHolidayPremium.toFixed(2)),
    daysWorked,
    totalRegularHours: parseFloat(totalRegularHours.toFixed(2)),
    totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
    hourlyRate: parseFloat(hourlyRate.toFixed(2)),
    overtimeRate: parseFloat(otRate.toFixed(2)),
    overtimePay: parseFloat(totalOvertimePay.toFixed(2)),
    grossPay: parseFloat(grossPay.toFixed(2)),
    // Breakdown by category
    breakdown: {
      normal: {
        label: 'Normal Days',
        daysWorked: normalPay.daysWorked,
        regularHours: normalPay.regularHours,
        basePay: normalPay.basePay,
        holidayPremium: 0,
        totalPay: normalPay.totalPay
      },
      regular: {
        label: 'Regular Holidays',
        daysWorked: regularHolidayPay.daysWorked,
        regularHours: regularHolidayPay.regularHours,
        basePay: regularHolidayPay.basePay,
        holidayPremium: regularHolidayPay.holidayPremium,
        totalPay: regularHolidayPay.totalPay
      },
      specialNonWorking: {
        label: 'Special Non-Working Holidays',
        daysWorked: specialNonWorkingPay.daysWorked,
        regularHours: specialNonWorkingPay.regularHours,
        basePay: specialNonWorkingPay.basePay,
        holidayPremium: specialNonWorkingPay.holidayPremium,
        totalPay: specialNonWorkingPay.totalPay
      },
      specialWorking: {
        label: 'Special Working Holidays',
        daysWorked: specialWorkingPay.daysWorked,
        regularHours: specialWorkingPay.regularHours,
        basePay: specialWorkingPay.basePay,
        holidayPremium: 0,
        totalPay: specialWorkingPay.totalPay
      }
    }
  };
};

module.exports = {
  calculateShiftSalary,
  calculateMonthlySalary,
  deriveHourlyRate,
  getHolidayMultiplier,
  HOLIDAY_MULTIPLIERS,
  WORKING_HOURS_PER_DAY
};
