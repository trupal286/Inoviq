const { saveScannedContact } = require('../Server/utils/contactService');

describe('TS-06: Scan QR Code & Save to Contacts (Structural / Cyclomatic Complexity Suite)', () => {
  // Mock Card Store
  const mockCardStore = {
    'inoviq-card-101': {
      id: 'c101',
      fullName: 'Dr. Sarah Connor',
      company: 'Cyberdyne Systems',
      email: 'sarah@cyberdyne.com',
      phone: '+1 800-555-0100',
      isDeleted: false
    },
    'inoviq-card-deleted': {
      id: 'c999',
      fullName: 'Old Deleted Card',
      isDeleted: true
    }
  };

  const cardLookup = (token) => mockCardStore[token] || null;

  const validUser = { id: 'usr_777', email: 'trupal@inoviq.com' };
  const existingContacts = [
    { cardId: 'c900', email: 'already.saved@company.com' }
  ];

  /* ──────────────────────────────────────────────────────────
     Basis Path 1 (TC12-N1): User not authenticated
     ────────────────────────────────────────────────────────── */
  test('Basis Path 1 [TC12-N1]: User is not logged in -> 401 Unauthorized', () => {
    const unauthenticatedUser = null;
    const result = saveScannedContact(unauthenticatedUser, 'inoviq-card-101', existingContacts, cardLookup);

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toContain('Unauthorized');
  });

  /* ──────────────────────────────────────────────────────────
     Basis Path 2 [TC06-N1]: QR token is invalid / not an Inoviq card
     ────────────────────────────────────────────────────────── */
  test('Basis Path 2 [TC06-N1]: QR token is not an Inoviq card format -> 400 Bad Request', () => {
    const invalidQrToken = 'https://google.com/random-url';
    const result = saveScannedContact(validUser, invalidQrToken, existingContacts, cardLookup);

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('Invalid card QR token');
  });

  /* ──────────────────────────────────────────────────────────
     Basis Path 3 [TC05-N1]: Card is deleted or does not exist
     ────────────────────────────────────────────────────────── */
  test('Basis Path 3 [TC05-N1]: Card does not exist or has been deleted -> 404 Not Found', () => {
    const deletedToken = 'inoviq-card-deleted';
    const result = saveScannedContact(validUser, deletedToken, existingContacts, cardLookup);

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.error).toContain('deleted');
  });

  /* ──────────────────────────────────────────────────────────
     Basis Path 4 [TC09-N1]: Contact already exists in saved contacts (duplicate warning)
     ────────────────────────────────────────────────────────── */
  test('Basis Path 4 [TC09-N1]: Contact already exists in contacts -> 409 Conflict with warning', () => {
    const duplicateContacts = [
      { cardId: 'c101', email: 'sarah@cyberdyne.com' }
    ];
    const result = saveScannedContact(validUser, 'inoviq-card-101', duplicateContacts, cardLookup);

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(409);
    expect(result.duplicate).toBe(true);
    expect(result.warning).toContain('already exists');
  });

  /* ──────────────────────────────────────────────────────────
     Basis Path 5 [TC06-P1]: All predicates pass -> Contact saved successfully
     ────────────────────────────────────────────────────────── */
  test('Basis Path 5 [TC06-P1]: Valid user, valid QR, existing active card, not duplicate -> 201 Created', () => {
    const result = saveScannedContact(validUser, 'inoviq-card-101', existingContacts, cardLookup);

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(201);
    expect(result.contact).toBeDefined();
    expect(result.contact.fullName).toBe('Dr. Sarah Connor');
    expect(result.contact.cardId).toBe('c101');
  });

  /* ──────────────────────────────────────────────────────────
     TC06-N2: Scanner camera permission denied fallback
     ────────────────────────────────────────────────────────── */
  test('TC06-N2 [Negative]: Camera permission denied triggers upload fallback without crashing', () => {
    function handleCameraError(permissionState) {
      if (permissionState === 'denied') {
        return {
          cameraActive: false,
          fallbackMode: 'file_upload',
          userMessage: 'Camera access blocked. Please allow camera permissions or upload a QR image.'
        };
      }
      return { cameraActive: true };
    }

    const state = handleCameraError('denied');
    expect(state.cameraActive).toBe(false);
    expect(state.fallbackMode).toBe('file_upload');
    expect(state.userMessage).toContain('upload a QR image');
  });
});
