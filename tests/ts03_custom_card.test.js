const { validateCardInput, validateLogoFile } = require('../Server/utils/validationHelper');

describe('TS-03: Create a Custom Card Suite', () => {
  function createCustomCard(cardData, logoFile = null) {
    const cardValidation = validateCardInput(cardData);
    if (!cardValidation.isValid) {
      return { success: false, statusCode: 400, errors: cardValidation.errors };
    }

    if (logoFile) {
      const logoValidation = validateLogoFile(logoFile);
      if (!logoValidation.isValid) {
        return { success: false, statusCode: 400, error: logoValidation.error };
      }
    }

    return {
      success: true,
      statusCode: 201,
      card: {
        id: 'card_custom_' + Date.now(),
        fullName: cardData.fullName,
        company: cardData.company,
        jobTitle: cardData.jobTitle,
        phone: cardData.phone,
        email: cardData.email,
        color: cardData.color || '#2D3536',
        font: cardData.font || 'Work Sans',
        logoUrl: logoFile ? `/uploads/${logoFile.name}` : null
      }
    };
  }

  test('TC03-P1 [Positive]: Create custom card with full details and valid PNG logo', () => {
    const cardData = {
      fullName: 'Trupal Panchal',
      company: 'Inoviq Tech',
      jobTitle: 'Senior Full Stack Lead',
      phone: '+91 9876543210',
      email: 'trupal@inoviq.com',
      color: '#1a1f2c',
      font: 'Work Sans'
    };
    const logoFile = { name: 'company_logo.png', size: 1024 * 500 }; // 500 KB PNG

    const result = createCustomCard(cardData, logoFile);
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(201);
    expect(result.card.fullName).toBe('Trupal Panchal');
    expect(result.card.logoUrl).toContain('company_logo.png');
  });

  test('TC03-N1 [Negative]: Leave Name empty or provide invalid email ("abc@")', () => {
    const invalidData = {
      fullName: '',
      company: 'Inoviq Tech',
      email: 'abc@',
      phone: ''
    };

    const result = createCustomCard(invalidData);
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.errors).toContain('Cardholder name is required');
    expect(result.errors).toContain('Invalid email address format');
  });

  test('TC03-N2 [Negative]: Reject dangerous file (.exe) or oversized logo (> 2 MB)', () => {
    const validCardData = {
      fullName: 'Trupal Panchal',
      company: 'Inoviq Tech',
      email: 'trupal@inoviq.com'
    };

    // Subcase 1: .exe file
    const exeFile = { name: 'virus.exe', size: 1024 * 100 };
    const exeResult = createCustomCard(validCardData, exeFile);
    expect(exeResult.success).toBe(false);
    expect(exeResult.error).toBe('Only JPG and PNG formats are allowed');

    // Subcase 2: > 2MB image
    const largeFile = { name: 'huge_pic.png', size: 3 * 1024 * 1024 }; // 3 MB
    const largeResult = createCustomCard(validCardData, largeFile);
    expect(largeResult.success).toBe(false);
    expect(largeResult.error).toBe('Logo file size exceeds the 2 MB limit');
  });
});
