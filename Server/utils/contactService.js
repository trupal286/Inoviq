/**
 * Contact Service - Handles QR scanning and contact persistence
 * Evaluated for Structural Complexity (Cyclomatic Complexity V(G) = 5)
 */

/**
 * Saves a scanned visiting card to the user's contacts list
 * 
 * Decision points for Cyclomatic Complexity:
 * 1. Is the user logged in (valid user token/session)?
 * 2. Is the QR code a valid Inoviq card token?
 * 3. Does the card still exist in database (not deleted)?
 * 4. Is the card not already saved in the user's contacts (duplicate check)?
 * 
 * @param {Object} user - Current logged-in user object
 * @param {string} qrToken - Scanned QR token (expected format: inoviq-card-<id>)
 * @param {Array} existingContacts - User's existing contacts array
 * @param {Function} findCardByToken - Card lookup callback/mock
 * @returns {Object} Result object with success flag and status message
 */
function saveScannedContact(user, qrToken, existingContacts = [], findCardByToken = null) {
  // Decision Point 1: User authentication check
  if (!user || !user.id) {
    return {
      success: false,
      statusCode: 401,
      error: 'Unauthorized: User is not logged in'
    };
  }

  // Decision Point 2: Valid QR token format check
  if (!qrToken || typeof qrToken !== 'string' || !qrToken.startsWith('inoviq-card-')) {
    return {
      success: false,
      statusCode: 400,
      error: 'Invalid card QR token'
    };
  }

  // Decision Point 3: Card existence check (lookup in catalog/repository)
  const card = findCardByToken ? findCardByToken(qrToken) : null;
  if (!card || card.isDeleted) {
    return {
      success: false,
      statusCode: 404,
      error: 'Card not found or has been deleted'
    };
  }

  // Decision Point 4: Duplicate contact check
  const isDuplicate = existingContacts.some(
    c => c.cardId === card.id || (card.email && c.email && c.email.toLowerCase() === card.email.toLowerCase())
  );

  if (isDuplicate) {
    return {
      success: false,
      statusCode: 409,
      duplicate: true,
      warning: 'Contact already exists in your contacts list'
    };
  }

  // Path 5: Successful contact save
  const newContact = {
    contactId: 'ct-' + Date.now(),
    cardId: card.id,
    userId: user.id,
    fullName: card.fullName,
    company: card.company,
    jobTitle: card.jobTitle || '',
    email: card.email || '',
    phone: card.phone || '',
    savedAt: new Date().toISOString()
  };

  return {
    success: true,
    statusCode: 201,
    message: 'Contact successfully saved to dashboard',
    contact: newContact
  };
}

module.exports = {
  saveScannedContact
};
