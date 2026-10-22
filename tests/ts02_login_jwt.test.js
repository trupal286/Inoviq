const jwt = require('jsonwebtoken');

describe('TS-02: User Login and JWT Authentication Suite', () => {
  const JWT_SECRET = 'inoviq_test_secret_key_2026';
  const mockUserDatabase = {
    'user@inoviq.com': {
      id: 'usr_001',
      email: 'user@inoviq.com',
      passwordHash: 'hashed_password_123',
      name: 'Trupal'
    }
  };

  function login(identifier, password) {
    // Check missing fields
    if (!identifier || !password) {
      return { success: false, statusCode: 400, message: 'Please provide identifier and password' };
    }

    // Security Check: Guard against NoSQL injection object payload
    if (typeof password !== 'string' || typeof identifier !== 'string') {
      return {
        success: false,
        statusCode: 400,
        message: 'Invalid input format: NoSQL injection attempt blocked'
      };
    }

    const user = mockUserDatabase[identifier.toLowerCase()];
    if (!user) {
      return { success: false, statusCode: 401, message: 'Invalid credentials' };
    }

    // Mock password match
    const isPasswordValid = password === 'ValidPassword123!';
    if (!isPasswordValid) {
      return { success: false, statusCode: 401, message: 'Invalid credentials' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      success: true,
      statusCode: 200,
      token,
      user: { id: user.id, email: user.email }
    };
  }

  test('TC02-P1 [Positive]: Valid email and password issues JWT token', () => {
    const result = login('user@inoviq.com', 'ValidPassword123!');
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.token).toBeDefined();

    const decoded = jwt.verify(result.token, JWT_SECRET);
    expect(decoded.email).toBe('user@inoviq.com');
  });

  test('TC02-N1 [Negative]: Valid email, wrong password returns 401', () => {
    const result = login('user@inoviq.com', 'WrongPassword999');
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.message).toBe('Invalid credentials');
    expect(result.token).toBeUndefined();
  });

  test('TC02-N2 [Negative]: Password field with NoSQL injection object payload is safely rejected', () => {
    // Attempting NoSQL injection: { "$ne": "" }
    const maliciousPayload = { "$ne": "" };
    const result = login('user@inoviq.com', maliciousPayload);

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.token).toBeUndefined();
  });
});
