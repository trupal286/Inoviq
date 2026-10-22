const { validateRegistration } = require('../Server/utils/validationHelper');

describe('TS-01: User Registration Suite', () => {
  // Mock user repository
  const existingUsers = [
    { email: 'existing.user@inoviq.com', firstName: 'John', lastName: 'Doe' }
  ];

  function registerUser(userData) {
    const validation = validateRegistration(userData);
    if (!validation.isValid) {
      return {
        success: false,
        statusCode: 400,
        errors: validation.errors
      };
    }

    const emailExists = existingUsers.some(
      u => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (emailExists) {
      return {
        success: false,
        statusCode: 409,
        message: 'Email already registered'
      };
    }

    return {
      success: true,
      statusCode: 201,
      message: 'Account created successfully',
      user: {
        id: 'usr_' + Date.now(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      }
    };
  }

  test('TC01-P1 [Positive]: Register with valid name, unique email, and strong password', () => {
    const input = {
      firstName: 'Trupal',
      lastName: 'Panchal',
      email: 'trupal.new@example.com',
      password: 'StrongPassword123'
    };

    const result = registerUser(input);
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(201);
    expect(result.user).toHaveProperty('id');
    expect(result.user.email).toBe('trupal.new@example.com');
  });

  test('TC01-N1 [Negative]: Register with an email that already exists', () => {
    const input = {
      firstName: 'Duplicate',
      lastName: 'User',
      email: 'existing.user@inoviq.com',
      password: 'StrongPassword123'
    };

    const result = registerUser(input);
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(409);
    expect(result.message).toBe('Email already registered');
  });

  test('TC01-N2 [Negative]: Leave fields blank or use weak password ("abc")', () => {
    const inputBlank = {
      firstName: '',
      lastName: '',
      email: 'invalid-email',
      password: 'abc'
    };

    const result = registerUser(inputBlank);
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.errors).toContain('First name is required');
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });
});
