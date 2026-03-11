import api from './api';

export const changePassword = async (currentPassword, newPassword) => {
    const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
    return data;
};
