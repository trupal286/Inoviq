describe('TS-04: Create a Card from a Template Suite', () => {
  const availableTemplates = ['Ledger', 'Minimal Dark', 'Ocean Gradient', 'Executive Emerald'];

  function createTemplateCard({ templateId, fullName, company, email, phone }) {
    if (!templateId || !availableTemplates.includes(templateId)) {
      return { success: false, statusCode: 400, message: 'Invalid or missing template selection' };
    }

    if (!fullName || !fullName.trim()) {
      return { success: false, statusCode: 400, message: 'Mandatory field missing: Cardholder name is required' };
    }

    if (!company || !company.trim()) {
      return { success: false, statusCode: 400, message: 'Mandatory field missing: Company name is required' };
    }

    return {
      success: true,
      statusCode: 201,
      card: {
        id: 'card_tpl_' + Date.now(),
        templateId,
        fullName: fullName.trim(),
        company: company.trim(),
        email: email || '',
        phone: phone || ''
      }
    };
  }

  test('TC04-P1 [Positive]: Select valid template and complete mandatory fields', () => {
    const input = {
      templateId: 'Ledger',
      fullName: 'Emily Watson',
      company: 'Quant Insight',
      email: 'emily@quantinsight.com',
      phone: '+1 415-555-0123'
    };

    const result = createTemplateCard(input);
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(201);
    expect(result.card.templateId).toBe('Ledger');
    expect(result.card.fullName).toBe('Emily Watson');
  });

  test('TC04-N1 [Negative]: Save template card with empty mandatory fields (fullName or company)', () => {
    const input = {
      templateId: 'Minimal Dark',
      fullName: '',
      company: '',
      email: 'emily@quantinsight.com'
    };

    const result = createTemplateCard(input);
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.message).toContain('Mandatory field missing');
  });
});
