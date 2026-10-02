import dotenv from 'dotenv';
dotenv.config();

/**
 * Validates whether an email has a valid format (allowing any email domain)
 * @param {string} email 
 * @returns {{isValid: boolean, domain: string, error?: string}}
 */
export const validateCollegeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, domain: '', error: 'Email address is required.' };
  }

  const normalized = email.trim().toLowerCase();
  const parts = normalized.split('@');
  if (parts.length !== 2 || !parts[1] || !parts[1].includes('.')) {
    return { isValid: false, domain: '', error: 'Please enter a valid email address format.' };
  }

  const domain = parts[1];

  return { isValid: true, domain };
};

export const getAllowedDomains = () => ['* (Any Email Address Accepted)'];
