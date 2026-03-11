import api from './api';

export const addShift = async (formData) => {
    const { data } = await api.post('/shifts', formData);
    return data;
};

export const getShifts = async (employeeId) => {
    const params = employeeId ? { employeeId } : {};
    const { data } = await api.get('/shifts', { params });
    return data;
}

export const updateShift = async (id, formData) => {
    const { data } = await api.put(`/shifts/${id}`, formData);
    return data;
};

export const deleteShift = async (id) => {
    const { data } = await api.delete(`/shifts/${id}`);
    return data;
};