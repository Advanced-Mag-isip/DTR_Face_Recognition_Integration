import api from './api';

export const getUsers = async () => {
    const { data } = await api.get('/users');
    return data;
};

export const createUser = async (userData) => {
    const { data } = await api.post('/users', userData);
    return data;
};

export const updateUser = async (id, userData) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
};

export const deleteUser = async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
};

export const savePayrollNote = async (id, period, note) => {
    const { data } = await api.put(`/users/${id}/payroll-note`, { period, note });
    return data;
};
