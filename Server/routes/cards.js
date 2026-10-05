const express = require('express');
const Card = require('../models/Card');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All card routes require authentication
router.use(authMiddleware);

/* ──────────────────────────────────────────────────────────
   GET /api/cards — List all cards for the current user
   ────────────────────────────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cards.length,
      cards
    });

  } catch (err) {
    console.error('List cards error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cards.'
    });
  }
});

/* ──────────────────────────────────────────────────────────
   POST /api/cards — Create a new card
   ────────────────────────────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const {
      fullName, jobTitle, company, email, phone,
      website, bio, templateStyle, templateLabel,
      color, accentColor, bgGradient
    } = req.body;

    if (!fullName || !company) {
      return res.status(400).json({
        success: false,
        message: 'Card holder name and company are required.'
      });
    }

    const card = await Card.create({
      userId: req.user.id,
      fullName,
      jobTitle: jobTitle || '',
      company,
      email: email || '',
      phone: phone || '',
      website: website || '',
      bio: bio || '',
      templateStyle: templateStyle || 'Dark Charcoal',
      templateLabel: templateLabel || 'Ledger',
      color: color || '#2D3536',
      accentColor: accentColor || '#B1D4D0',
      bgGradient: bgGradient || 'linear-gradient(135deg, #2D3536 0%, #1A2223 100%)'
    });

    res.status(201).json({
      success: true,
      message: 'Card created successfully!',
      card
    });

  } catch (err) {
    console.error('Create card error:', err);

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(' ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create card.'
    });
  }
});

/* ──────────────────────────────────────────────────────────
   PUT /api/cards/:id — Update a card
   ────────────────────────────────────────────────────────── */
router.put('/:id', async (req, res) => {
  try {
    const card = await Card.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found.'
      });
    }

    // Update only provided fields
    const allowedFields = [
      'fullName', 'jobTitle', 'company', 'email', 'phone',
      'website', 'bio', 'templateStyle', 'templateLabel',
      'color', 'accentColor', 'bgGradient'
    ];

    allowedFields.forEach(function (field) {
      if (req.body[field] !== undefined) {
        card[field] = req.body[field];
      }
    });

    await card.save();

    res.json({
      success: true,
      message: 'Card updated successfully!',
      card
    });

  } catch (err) {
    console.error('Update card error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update card.'
    });
  }
});

/* ──────────────────────────────────────────────────────────
   DELETE /api/cards/:id — Delete a card
   ────────────────────────────────────────────────────────── */
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found.'
      });
    }

    res.json({
      success: true,
      message: 'Card deleted successfully.'
    });

  } catch (err) {
    console.error('Delete card error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete card.'
    });
  }
});

module.exports = router;
