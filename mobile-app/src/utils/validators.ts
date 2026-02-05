/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength (min 8 chars)
 */
export const isValidPassword = (password: string): boolean => {
    return password.length >= 8;
};

/**
 * Validate phone number (Malaysian format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Check if string is empty or whitespace only
 */
export const isEmpty = (value: string | null | undefined): boolean => {
    return !value || value.trim().length === 0;
};

/**
 * Validate required field
 */
export const isRequired = (value: string | null | undefined): boolean => {
    return !isEmpty(value);
};

/**
 * Validate minimum length
 */
export const minLength = (value: string, min: number): boolean => {
    return value.length >= min;
};

/**
 * Validate maximum length
 */
export const maxLength = (value: string, max: number): boolean => {
    return value.length <= max;
};
