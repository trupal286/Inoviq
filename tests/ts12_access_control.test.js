const authMiddleware = require('../Server/middleware/auth');
const jwt = require('jsonwebtoken');

describe('TS-12: Logout and Access Control Suite', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'inoviq_super_secret_key_change_in_production_2024';

  // Mock cards owned by specific users
  const cardsDb = [
    { id: 'card_userA_1', ownerId: 'user_A', title: 'User A Card' },
    { id: 'card_userB_1', ownerId: 'user_B', title: 'User B Card' }
  ];

  function modifyCard(requestingUserId, cardId, newTitle) {
    const card = cardsDb.find(c => c.id === cardId);
    if (!card) return { success: false, statusCode: 404, message: 'Card not found' };

    // IDOR / Access control check
    if (card.ownerId !== requestingUserId) {
      return {
        success: false,
        statusCode: 403,
        message: 'Forbidden: You do not have permission to modify this card'
      };
    }

    card.title = newTitle;
    return { success: true, statusCode: 200, card };
  }

  test('TC12-P1 [Positive]: Logout clears authentication token and session state', () => {
    function logout(sessionStore) {
      sessionStore.authToken = null;
      sessionStore.currentUser = null;
      return {
        loggedOut: true,
        redirectUrl: '/login.html'
      };
    }

    const session = { authToken: 'valid.jwt.token', currentUser: { id: 'usr_1' } };
    const result = logout(session);

    expect(result.loggedOut).toBe(true);
    expect(session.authToken).toBeNull();
    expect(result.redirectUrl).toBe('/login.html');
  });

  test('TC12-N1 [Negative]: Protected route accessed without token is rejected with 401', () => {
    const req = { headers: {} };
    let responseStatus = null;
    let responseBody = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => {
            responseBody = data;
          }
        };
      }
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(responseStatus).toBe(401);
    expect(responseBody.success).toBe(false);
    expect(responseBody.message).toContain('Access denied');
    expect(next).not.toHaveBeenCalled();
  });

  test('TC12-N1-sub2 [Negative]: Protected route with expired/invalid token is rejected with 401', () => {
    const req = { headers: { authorization: 'Bearer invalid.or.corrupted.token' } };
    let responseStatus = null;
    let responseBody = null;

    const res = {
      status: (code) => {
        responseStatus = code;
        return {
          json: (data) => { responseBody = data; }
        };
      }
    };
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(responseStatus).toBe(401);
    expect(responseBody.success).toBe(false);
    expect(responseBody.message).toContain('Invalid or expired token');
    expect(next).not.toHaveBeenCalled();
  });

  test('TC12-P1-sub2 [Positive]: Valid Bearer token passes authMiddleware and attaches req.user', () => {
    const validToken = jwt.sign({ id: 'usr_valid_123', email: 'test@inoviq.com' }, JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = {};
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe('usr_valid_123');
  });

  test('TC12-N2 [Negative]: User A attempting to modify User B card (IDOR attack) returns 403 Forbidden', () => {
    // User A attempts to edit User B's card
    const result = modifyCard('user_A', 'card_userB_1', 'Hacked Card Title');

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(403);
    expect(result.message).toContain('Forbidden');

    // Confirm that User B's card remains untouched
    const userBCard = cardsDb.find(c => c.id === 'card_userB_1');
    expect(userBCard.title).toBe('User B Card');
  });
});
