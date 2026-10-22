const { processOCRCard } = require('../Server/utils/validationHelper');

describe('TS-07: Scan a Physical Card (OCR) Suite', () => {
  test('TC07-P1 [Positive]: Clear photo of visiting card extracts text fields', () => {
    const clearImage = {
      name: 'card_scan_clear.jpg',
      size: 1024 * 300,
      isBlurry: false,
      isBlank: false
    };

    const result = processOCRCard(clearImage);
    expect(result.success).toBe(true);
    expect(result.extractedData).toBeDefined();
    expect(result.extractedData.fullName).toBe('Alex Morgan');
    expect(result.extractedData.email).toBe('alex@apextech.com');
  });

  test('TC07-N1 [Negative]: Blurry or blank image offers manual entry without saving', () => {
    const blurryImage = {
      name: 'blurry_card.png',
      size: 1024 * 120,
      isBlurry: true,
      isBlank: false
    };

    const result = processOCRCard(blurryImage);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not read text');
    expect(result.error).toContain('manual entry');
  });

  test('TC07-N2 [Negative]: Uploading non-image file (.exe/.txt) to OCR scanner is rejected', () => {
    const badFile = {
      name: 'malware.exe',
      size: 1024 * 50
    };

    const result = processOCRCard(badFile);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Only image files');
  });
});
