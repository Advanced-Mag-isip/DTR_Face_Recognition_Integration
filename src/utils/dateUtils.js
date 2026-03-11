/**
 * Get the start and end date of the current month
 * @returns {Object} Object with startDate and endDate in YYYY-MM-DD format
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
  
  return { startDate, endDate };
};

/**
 * Get the start and end date of a specific month
 * @param {string} monthStr - Month string in YYYY-MM format
 * @returns {Object} Object with startDate and endDate in YYYY-MM-DD format
 */
export const getMonthRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  return { startDate, endDate };
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format currency (Philippine Peso)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `₱${parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
