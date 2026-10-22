/**
 * vCard Helper - Exports card details into standard RFC 6350 / vCard 3.0 format
 */

/**
 * Generate a .vcf formatted string from contact object
 * @param {Object} contact - Contact information
 * @returns {string} Formatted vCard text
 */
function exportContactToVCard(contact) {
  if (!contact || typeof contact !== 'object' || (!contact.fullName && !contact.name)) {
    throw new Error('Contact not found or invalid contact data');
  }

  const name = (contact.fullName || contact.name || '').trim();
  const nameParts = name.split(/\s+/);
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : name;

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `N:${lastName};${firstName};;;`
  ];

  if (contact.company) {
    lines.push(`ORG:${contact.company}`);
  }

  if (contact.jobTitle || contact.title) {
    lines.push(`TITLE:${contact.jobTitle || contact.title}`);
  }

  if (contact.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${contact.phone}`);
  }

  if (contact.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${contact.email}`);
  }

  if (contact.website) {
    lines.push(`URL:${contact.website}`);
  }

  if (contact.bio) {
    lines.push(`NOTE:${contact.bio.replace(/\n/g, '\\n')}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

module.exports = {
  exportContactToVCard
};
