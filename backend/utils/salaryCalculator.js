/**
 * Working hours per day (8 hours/day)
 */
const WORKING_HOURS_PER_DAY = 8;

/**
 * Working days per month (for monthly calculations)
 */
const WORKING_DAYS_PER_MONTH = 26;

/**
 * Get hourly and daily rates based on payment type
 * @param {string} paymentType - 'hourly' or 'monthly'
 * @param {number} hourlyRate - Direct hourly rate (for hourly workers)
 * @param {number} monthlySalary - Monthly salary (for monthly workers)
 * @returns {Object} { hourlyRate, dailyRate }
 */
const getRatesByPaymentType = (paymentType, hourlyRate, monthlySalary) => {
  if (paymentType === 'monthly' && monthlySalary && monthlySalary > 0) {
    const dailyRate = monthlySalary / WORKING_DAYS_PER_MONTH;
    const hourly = dailyRate / WORKING_HOURS_PER_DAY;
    return { hourlyRate: hourly, dailyRate };
  }
  
  // For hourly workers or fallback
  const hourly = hourlyRate && hourlyRate > 0 ? hourlyRate : 0;
  return { hourlyRate: hourly, dailyRate: hourly * WORKING_HOURS_PER_DAY };
};

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
 * Derive hourly rate from daily salary (legacy support)
 * @param {number} dailySalary - The employee's daily salary
 * @returns {number} Hourly rate
 */
const deriveHourlyRate = (dailySalary) => {
  if (!dailySalary || dailySalary <= 0) return 0;
  return dailySalary / WORKING_HOURS_PER_DAY;
};

/**
 * Get rates for salary calculation
 * @param {string} paymentType - 'hourly' or 'monthly'
 * @param {number} hourlyRate - Direct hourly rate
 * @param {number} monthlySalary - Monthly salary
 * @param {number} overtimeHourlyRate - Overtime rate
 * @returns {Object} { hourlyRate, dailyRate, overtimeRate }
 */
const getCalculationRates = (paymentType, hourlyRate, monthlySalary, overtimeHourlyRate) => {
  const { hourlyRate: baseHourly, dailyRate } = getRatesByPaymentType(paymentType, hourlyRate, monthlySalary);
  
  const otRate = overtimeHourlyRate && overtimeHourlyRate > 0
    ? overtimeHourlyRate
    : baseHourly;
  
  return {
    hourlyRate: baseHourly,
    dailyRate,
    overtimeRate: otRate
  };
};

/**
 * Calculate salary for a single shift with holiday consideration
 * @param {Object} shift - Shift object with morningHours, afternoonHours, overtimeHours, holidayType
 * @param {string} paymentType - 'hourly' or 'monthly'
 * @param {number} hourlyRate - Employee's hourly rate (for hourly workers)
 * @param {number} monthlySalary - Employee's monthly salary (for monthly workers)
 * @param {number} overtimeHourlyRate - Optional overtime hourly rate (auto-calculated if not provided)
 * @returns {Object} Salary breakdown for the shift
 */
const calculateShiftSalary = (shift, paymentType, hourlyRate, monthlySalary, overtimeHourlyRate) => {
  const { hourlyRate: baseHourly, overtimeRate: otRate } = getCalculationRates(
    paymentType, hourlyRate, monthlySalary, overtimeHourlyRate
  );

  const regularHours = (shift.morningHours || 0) + (shift.afternoonHours || 0);
  const overtimeHours = shift.overtimeHours || 0;

  // Get holiday multiplier
  const holidayMultiplier = getHolidayMultiplier(shift.holidayType);
  
  // Calculate base pay for regular hours
  const baseRegularPay = regularHours * baseHourly;
  
  // Calculate holiday premium (extra pay portion)
  const holidayPremium = baseRegularPay * (holidayMultiplier - 1);
  
  // Total regular pay includes base + holiday premium
  const regularPay = baseRegularPay + holidayPremium;
  
  // Overtime pay (note: OT on holidays could have separate multiplier in future)
  const overtimePay = overtimeHours * otRate;

  return {
    regularHours,
    overtimeHours,
    hourlyRate: parseFloat(baseHourly.toFixed(2)),
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
 * @param {string} paymentType - 'hourly' or 'monthly'
 * @param {number} hourlyRate - Employee's hourly rate (for hourly workers)
 * @param {number} monthlySalary - Employee's monthly salary (for monthly workers)
 * @param {number} overtimeHourlyRate - Optional overtime hourly rate
 * @returns {Object} Complete salary breakdown with holiday categories
 */
const calculateMonthlySalary = (shifts, paymentType, hourlyRate, monthlySalary, overtimeHourlyRate) => {
  const { hourlyRate: baseHourly, dailyRate } = getCalculationRates(
    paymentType, hourlyRate, monthlySalary, overtimeHourlyRate
  );
  const otRate = overtimeHourlyRate && overtimeHourlyRate > 0
    ? overtimeHourlyRate
    : baseHourly;

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

    const basePay = categoryRegularHours * baseHourly;
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
  let totalBasePay = normalPay.basePay + regularHolidayPay.basePay + 
                       specialNonWorkingPay.basePay + specialWorkingPay.basePay;
  const totalHolidayPremium = regularHolidayPay.holidayPremium + specialNonWorkingPay.holidayPremium;
  const totalOvertimePay = normalPay.overtimePay + regularHolidayPay.overtimePay + 
                           specialNonWorkingPay.overtimePay + specialWorkingPay.overtimePay;
  
  // Fixed Monthly Salary Logic: 
  // If monthly payment type and calculated base is less than monthly salary, use monthly salary
  if (paymentType === 'monthly' && monthlySalary > 0) {
    if (totalBasePay < monthlySalary) {
      totalBasePay = monthlySalary;
    }
  }

  const grossPay = totalBasePay + totalHolidayPremium + totalOvertimePay;

  return {
    baseSalary: parseFloat(totalBasePay.toFixed(2)),
    totalHolidayPremium: parseFloat(totalHolidayPremium.toFixed(2)),
    daysWorked,
    totalRegularHours: parseFloat(totalRegularHours.toFixed(2)),
    totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
    hourlyRate: parseFloat(baseHourly.toFixed(2)),
    dailyRate: parseFloat(dailyRate.toFixed(2)),
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
  getRatesByPaymentType,
  getCalculationRates,
  getHolidayMultiplier,
  HOLIDAY_MULTIPLIERS,
  WORKING_HOURS_PER_DAY,
  WORKING_DAYS_PER_MONTH
};
