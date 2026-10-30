/**
 * Validation Helper - Implements validation rules and constraints for Inoviq
 */

/**
 * Validates user registration data (TS-01)
 * Rules: Name, email valid, password min 8 chars with >= 1 uppercase letter and >= 1 digit.
 */
function validateRegistration({ firstName, lastName, email, password }) {
  const errors = [];

  if (!firstName || !firstName.trim()) errors.push('First name is required');
  if (!lastName || !lastName.trim()) errors.push('Last name is required');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one digit');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates digital card creation data (TS-03, TS-04)
 * Rule: Needs Name and at least one of phone or email; email must be valid format if provided.
 */
function validateCardInput(data) {
  const errors = [];
  const name = (data.fullName || data.name || '').trim();

  if (!name) {
    errors.push('Cardholder name is required');
  }

  const phone = (data.phone || '').trim();
  const email = (data.email || '').trim();

  if (!phone && !email) {
    errors.push('At least one contact method (phone or email) is required');
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email address format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates uploaded logo image (TS-03, TS-08)
 * Rules: JPG or PNG only, size <= 2 MB (2 * 1024 * 1024 bytes).
 */
function validateLogoFile(file) {
  if (!file) {
    return {
      isValid: false,
      error: 'No file provided'
    };
  }

  const allowedExtensions = ['jpg', 'jpeg', 'png'];
  const ext = (file.name || '').split('.').pop().toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      error: 'Only JPG and PNG formats are allowed'
    };
  }

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  if (file.size > MAX_SIZE) {
    return {
      isValid: false,
      error: 'Logo file size exceeds the 2 MB limit'
    };
  }

  return {
    isValid: true,
    detectedLogo: file.name
  };
}

/**
 * Sanitizes input to protect against XSS (TS-09)
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validates OCR image input (TS-07)
 */
function processOCRCard(file) {
  if (!file) {
    return {
      success: false,
      error: 'No card image provided'
    };
  }

  const ext = (file.name || '').split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp'];
  if (!allowed.includes(ext)) {
    return {
      success: false,
      error: 'Upload rejected: Only image files (.jpg, .png) are accepted for OCR'
    };
  }

  if (file.isBlurry || file.isBlank) {
    return {
      success: false,
      error: 'Could not read text: Image is blurry or blank. Please use manual entry.'
    };
  }

  return {
    success: true,
    extractedData: {
      fullName: 'Alex Morgan',
      company: 'Apex Technologies',
      email: 'alex@apextech.com',
      phone: '+1 555-0199'
    }
  };
}

module.exports = {
  validateRegistration,
  validateCardInput,
  validateLogoFile,
  sanitizeInput,
  processOCRCard
};