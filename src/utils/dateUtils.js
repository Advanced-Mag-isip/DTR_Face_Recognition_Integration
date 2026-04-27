/**
 * Format date to YYYY-MM-DD in local time
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
 * Get the start and end date of the current month
 * @returns {Object} Object with startDate and endDate in YYYY-MM-DD format
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const startDate = formatDate(new Date(year, month, 1));
  const endDate = formatDate(new Date(year, month + 1, 0));
  
  return { startDate, endDate };
};

/**
 * Get the start and end date of a specific month
 * @param {string} monthStr - Month string in YYYY-MM format
 * @returns {Object} Object with startDate and endDate in YYYY-MM-DD format
 */
export const getMonthRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  
  const startDate = formatDate(new Date(year, month - 1, 1));
  const endDate = formatDate(new Date(year, month, 0));
  
  return { startDate, endDate };
};

/**
 * Get all Fridays in a given month
 * @param {number} year - The year
 * @param {number} monthNum - The month (1-12)
 * @returns {Date[]} Array of Date objects representing Fridays
 */
export const getFridaysInMonth = (year, monthNum) => {
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

/**
 * Format currency (Philippine Peso)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return `₱${parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
