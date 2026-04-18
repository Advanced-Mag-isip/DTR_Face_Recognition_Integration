import api from './api';

/**
 * Get all holidays with optional date range filter
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} List of holidays
 */
export const getHolidays = async (startDate, endDate) => {
    const params = {};
    if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    }
    const { data } = await api.get('/holidays', { params });
    return data;
};

/**
 * Check if a specific date is a holiday
 * @param {string} date - Date to check (YYYY-MM-DD)
 * @returns {Promise<Object>} Holiday info or { isHoliday: false }
 */
export const checkHoliday = async (date) => {
    const { data } = await api.get(`/holidays/check/${date}`);
    return data;
};

/**
 * Create a new holiday (admin only)
 * @param {Object} holidayData - Holiday data { name, date, type, description }
 * @returns {Promise<Object>} Created holiday
 */
export const createHoliday = async (holidayData) => {
    const { data } = await api.post('/holidays', holidayData);
    return data;
};

/**
 * Update an existing holiday (admin only)
 * @param {number} id - Holiday ID
 * @param {Object} holidayData - Updated holiday data
 * @returns {Promise<Object>} Updated holiday
 */
export const updateHoliday = async (id, holidayData) => {
    const { data } = await api.put(`/holidays/${id}`, holidayData);
    return data;
};

/**
 * Delete a holiday (admin only)
 * @param {number} id - Holiday ID
 * @returns {Promise<Object>} Success message
 */
export const deleteHoliday = async (id) => {
    const { data } = await api.delete(`/holidays/${id}`);
    return data;
};
