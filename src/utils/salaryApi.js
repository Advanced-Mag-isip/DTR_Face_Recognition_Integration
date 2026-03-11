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
