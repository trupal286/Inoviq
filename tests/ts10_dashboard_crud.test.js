describe('TS-10: My Cards Dashboard Suite (Edit, Delete, Search)', () => {
  let userCards = [
    { id: 'card_10', userId: 'u1', fullName: 'Trupal Panchal', phone: '+91 9999900000', company: 'Inoviq Tech', tag: 'Executive' },
    { id: 'card_20', userId: 'u1', fullName: 'Rohit Sharma', phone: '+91 8888800000', company: 'Apex Global', tag: 'Sales' }
  ];

  function updateCard(userId, cardId, updates) {
    const card = userCards.find(c => c.id === cardId && c.userId === userId);
    if (!card) return { success: false, statusCode: 404, message: 'Card not found' };

    Object.assign(card, updates);
    return { success: true, statusCode: 200, card };
  }

  function deleteCard(userId, cardId, confirmed) {
    if (!confirmed) return { success: false, statusCode: 400, message: 'Deletion prompt rejected' };

    const index = userCards.findIndex(c => c.id === cardId && c.userId === userId);
    if (index === -1) return { success: false, statusCode: 404, message: 'Card not found' };

    userCards.splice(index, 1);
    return { success: true, statusCode: 200, message: 'Card successfully removed' };
  }

  function searchCards(query) {
    if (!query) return { success: true, count: userCards.length, results: userCards };
    const q = query.toLowerCase();
    const results = userCards.filter(c =>
      c.fullName.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      (c.tag && c.tag.toLowerCase().includes(q))
    );

    if (results.length === 0) {
      return { success: true, count: 0, results: [], message: 'No contacts found' };
    }

    return { success: true, count: results.length, results };
  }

  test('TC10-P1 [Positive]: Edit own card phone number updates successfully', () => {
    const result = updateCard('u1', 'card_10', { phone: '+91 9876543210' });
    expect(result.success).toBe(true);
    expect(result.card.phone).toBe('+91 9876543210');
  });

  test('TC10-P2 [Positive]: Delete own card upon confirmation prompt', () => {
    const result = deleteCard('u1', 'card_20', true);
    expect(result.success).toBe(true);
    expect(userCards.find(c => c.id === 'card_20')).toBeUndefined();
  });

  test('TC10-P3 [Positive]: Search contacts by matching company or name', () => {
    const search = searchCards('Inoviq');
    expect(search.success).toBe(true);
    expect(search.count).toBe(1);
    expect(search.results[0].fullName).toBe('Trupal Panchal');
  });

  test('TC10-N1 [Negative]: Search for unmatched keyword ("zzzxyz") returns friendly message without crashing', () => {
    const search = searchCards('zzzxyz');
    expect(search.success).toBe(true);
    expect(search.count).toBe(0);
    expect(search.message).toBe('No contacts found');
  });
});
