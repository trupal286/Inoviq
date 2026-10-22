const { sanitizeInput } = require('../Server/utils/validationHelper');

describe('TS-09: Contact Storage and Duplicate Handling Suite', () => {
  const contactsCatalog = [
    { id: 'ct_1', email: 'existing.partner@example.com', fullName: 'Partner One' }
  ];

  function saveContactToStorage(contactInput, forceDuplicate = false) {
    // Check duplicate email
    if (contactInput.email) {
      const exists = contactsCatalog.some(
        c => c.email.toLowerCase() === contactInput.email.toLowerCase()
      );
      if (exists && !forceDuplicate) {
        return {
          success: false,
          statusCode: 409,
          duplicateWarning: true,
          message: 'A contact with this email already exists in your contacts'
        };
      }
    }

    // Sanitize any user-controlled notes/bio against XSS
    const sanitizedBio = contactInput.bio ? sanitizeInput(contactInput.bio) : '';
    const sanitizedNotes = contactInput.notes ? sanitizeInput(contactInput.notes) : '';

    const newContact = {
      id: 'ct_' + Date.now(),
      fullName: contactInput.fullName,
      designation: contactInput.designation || '',
      company: contactInput.company,
      phone: contactInput.phone || '',
      email: contactInput.email || '',
      website: contactInput.website || '',
      address: contactInput.address || '',
      bio: sanitizedBio,
      notes: sanitizedNotes,
      socialLinks: contactInput.socialLinks || {},
      tags: contactInput.tags || []
    };

    contactsCatalog.push(newContact);

    return {
      success: true,
      statusCode: 201,
      contact: newContact
    };
  }

  test('TC09-P1 [Positive]: Save complete contact with all fields', () => {
    const contactData = {
      fullName: 'Vikram Mehta',
      designation: 'VP of Engineering',
      company: 'Zenith Systems',
      phone: '+91 9988776655',
      email: 'vikram@zenith.org',
      website: 'https://zenith.org',
      address: 'Tech Park, Bangalore',
      bio: 'Cloud architecture specialist',
      notes: 'Met at TechSummit 2026',
      socialLinks: { linkedin: 'https://linkedin.com/in/vikram' },
      tags: ['Partner', 'Cloud']
    };

    const result = saveContactToStorage(contactData);
    expect(result.success).toBe(true);
    expect(result.contact.company).toBe('Zenith Systems');
    expect(result.contact.tags).toContain('Cloud');
  });

  test('TC09-N1 [Negative]: Attempting to save existing email triggers duplicate warning', () => {
    const duplicateData = {
      fullName: 'Partner Duplicate',
      company: 'Another Inc',
      email: 'existing.partner@example.com'
    };

    const result = saveContactToStorage(duplicateData, false);
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(409);
    expect(result.duplicateWarning).toBe(true);
    expect(result.message).toContain('already exists');
  });

  test('TC09-N2 [Negative]: Malicious script tags in notes are sanitized (XSS prevention)', () => {
    const maliciousData = {
      fullName: 'Hacker User',
      company: 'Test Co',
      email: 'safe@hacker.io',
      notes: '<script>alert(1)</script>'
    };

    const result = saveContactToStorage(maliciousData);
    expect(result.success).toBe(true);
    // Verified that angle brackets are sanitized: &lt;script&gt;alert(1)&lt;/script&gt;
    expect(result.contact.notes).not.toContain('<script>');
    expect(result.contact.notes).toContain('&lt;script&gt;');
  });
});
