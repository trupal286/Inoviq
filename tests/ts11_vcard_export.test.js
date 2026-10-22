const { exportContactToVCard } = require('../Server/utils/vcardHelper');

describe('TS-11: Export Contact as vCard (.vcf) Suite', () => {
  const contactsRepository = {
    'contact_1': {
      fullName: 'Trupal Panchal',
      company: 'Inoviq Tech',
      jobTitle: 'Lead Architect',
      phone: '+91 9876543210',
      email: 'trupal@inoviq.com',
      website: 'https://inoviq.app',
      bio: 'Full stack digital business cards'
    }
  };

  function handleVCardExport(contactId) {
    const contact = contactsRepository[contactId];
    if (!contact) {
      return {
        success: false,
        statusCode: 404,
        error: 'Contact not found; cannot generate vCard'
      };
    }

    const vcfString = exportContactToVCard(contact);
    return {
      success: true,
      statusCode: 200,
      filename: `${contact.fullName.replace(/\s+/g, '_')}.vcf`,
      contentType: 'text/vcard',
      data: vcfString
    };
  }

  test('TC11-P1 [Positive]: Export valid contact as RFC-compliant .vcf file string', () => {
    const result = handleVCardExport('contact_1');
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.contentType).toBe('text/vcard');
    expect(result.filename).toBe('Trupal_Panchal.vcf');
    expect(result.data).toContain('BEGIN:VCARD');
    expect(result.data).toContain('VERSION:3.0');
    expect(result.data).toContain('FN:Trupal Panchal');
    expect(result.data).toContain('ORG:Inoviq Tech');
    expect(result.data).toContain('TEL;TYPE=CELL,VOICE:+91 9876543210');
    expect(result.data).toContain('EMAIL;TYPE=INTERNET,PREF:trupal@inoviq.com');
    expect(result.data).toContain('END:VCARD');
  });

  test('TC11-N1 [Negative]: Export non-existent or deleted contact returns error without generating file', () => {
    const result = handleVCardExport('invalid_id_999');
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.error).toContain('Contact not found');
    expect(result.data).toBeUndefined();
  });

  test('TC11-P1-sub2 [Positive]: Export single-name contact without optional fields', () => {
    const singleNameContact = { fullName: 'Cher' };
    const vcf = exportContactToVCard(singleNameContact);
    expect(vcf).toContain('FN:Cher');
    expect(vcf).toContain('N:;Cher;;;');
  });
});
