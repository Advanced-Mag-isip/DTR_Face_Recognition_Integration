import api from './api';

/**
 * Get salary computation for current month
 * @param {string} employeeId - Optional employee ID (admin only)
 * @returns {Promise<Object>} Salary data
 */
export const getCurrentMonthSalary = async (employeeId) => {
  const params = employeeId ? { employeeId } : {};
  const { data } = await api.get('/salary/current-month', { params });
  return data;
};

/**
 * Get salary computation for a specific period
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} employeeId - Optional employee ID (admin only)
 * @returns {Promise<Object>} Salary data
 */
export const getSalaryForPeriod = async (startDate, endDate, employeeId) => {
  const params = { startDate, endDate };
  if (employeeId) params.employeeId = employeeId;
  const { data } = await api.get('/salary/compute', { params });
  return data;
};

/**
 * Get unpaid shifts for an employee
 * @param {string} employeeId - Employee ID
 * @param {string} payPeriod - 'first' or 'second' cut-off period
 * @param {string} month - Month in YYYY-MM format
 * @returns {Promise<Object>} Unpaid shifts data
 */
export const getUnpaidShifts = async (employeeId, payPeriod, month) => {
  const params = { employeeId };
  if (payPeriod) params.payPeriod = payPeriod;
  if (month) params.month = month;
  const { data } = await api.get('/salary/unpaid', { params });
  return data;
};

/**
 * Mark shifts as paid
 * @param {Object} payload - Payment payload
 * @param {string} payload.employeeId - Employee ID
 * @param {string[]} payload.shiftIds - Array of shift IDs (optional)
 * @param {string} payload.payPeriod - 'first' or 'second' cut-off
 * @param {string} payload.startDate - Start date (optional)
 * @param {string} payload.endDate - End date (optional)
 * @returns {Promise<Object>} Payment result
 */
export const payShifts = async ({ employeeId, shiftIds, payPeriod, startDate, endDate }) => {
  const { data } = await api.post('/salary/pay', {
    employeeId,
    shiftIds,
    payPeriod,
    startDate,
    endDate
  });
  return data;
};
