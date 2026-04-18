import api from './api';

/**
 * Get all active departments
 * @param {boolean} includeInactive - Include inactive departments (admin only)
 * @returns {Promise<Array>} List of departments
 */
export const getDepartments = async (includeInactive = false) => {
  const params = includeInactive ? { includeInactive: 'true' } : {};
  const { data } = await api.get('/departments', { params });
  return data;
};

/**
 * Create a new department (admin only)
 * @param {Object} departmentData - Department data
 * @param {string} departmentData.name - Department name
 * @param {string} [departmentData.description] - Department description
 * @returns {Promise<Object>} Created department
 */
export const createDepartment = async (departmentData) => {
  const { data } = await api.post('/departments', departmentData);
  return data;
};

/**
 * Update a department (admin only)
 * @param {number} id - Department ID
 * @param {Object} departmentData - Updated department data
 * @returns {Promise<Object>} Updated department
 */
export const updateDepartment = async (id, departmentData) => {
  const { data } = await api.put(`/departments/${id}`, departmentData);
  return data;
};

/**
 * Delete (deactivate) a department (admin only)
 * @param {number} id - Department ID
 * @returns {Promise<Object>} Success message
 */
export const deleteDepartment = async (id) => {
  const { data } = await api.delete(`/departments/${id}`);
  return data;
};
