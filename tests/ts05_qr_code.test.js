describe('TS-05: QR Code Generation and Sharing Suite', () => {
  const cardsDb = new Map([
    ['card_001', { id: 'card_001', fullName: 'Trupal Panchal', isDeleted: false, token: 'inoviq-card-001' }],
    ['card_002', { id: 'card_002', fullName: 'Archived Card', isDeleted: true, token: 'inoviq-card-002' }]
  ]);

  function resolveCardByQR(token) {
    if (!token || !token.startsWith('inoviq-card-')) {
      return { success: false, statusCode: 400, message: 'Invalid QR token format' };
    }

    const cardId = token.replace('inoviq-card-', 'card_');
    const card = cardsDb.get(cardId);

    if (!card || card.isDeleted) {
      return { success: false, statusCode: 404, message: 'Card not found or has been deleted' };
    }

    return {
      success: true,
      statusCode: 200,
      preview: {
        id: card.id,
        fullName: card.fullName,
        shareUrl: `https://inoviq.app/c/${token}`
      }
    };
  }

  test('TC05-P1 [Positive]: Scanning active card QR generates valid preview URL and card details', () => {
    const result = resolveCardByQR('inoviq-card-001');
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.preview.fullName).toBe('Trupal Panchal');
    expect(result.preview.shareUrl).toBe('https://inoviq.app/c/inoviq-card-001');
  });

  test('TC05-N1 [Negative]: Scan QR code of a card that has been deleted', () => {
    const result = resolveCardByQR('inoviq-card-002');
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.message).toBe('Card not found or has been deleted');
  });

  test('TC05-N2 [Negative]: Tampered / invalid QR token format is rejected', () => {
    const result = resolveCardByQR('malformed_token_999');
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.message).toBe('Invalid QR token format');
  });
});
