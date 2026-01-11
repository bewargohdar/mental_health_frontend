import api from './axios';

/**
 * Request a password reset link to be sent to the user's email
 * @param {string} email - User's email address
 * @returns {Promise} API response
 */
export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

/**
 * Reset the user's password using the token from email
 * @param {Object} data - Reset password data
 * @param {string} data.token - Reset token from email link
 * @param {string} data.email - User's email address
 * @param {string} data.password - New password
 * @param {string} data.password_confirmation - Password confirmation
 * @returns {Promise} API response
 */
export const resetPassword = async ({ token, email, password, password_confirmation }) => {
    const response = await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation,
    });
    return response.data;
};
