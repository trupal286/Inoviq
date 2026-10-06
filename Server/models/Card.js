const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Cardholder name is required'],
    trim: true,
    maxlength: 100
  },
  jobTitle: {
    type: String,
    trim: true,
    default: ''
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  website: {
    type: String,
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: '',
    maxlength: 500
  },
  templateStyle: {
    type: String,
    default: 'Dark Charcoal'
  },
  templateLabel: {
    type: String,
    default: 'Ledger'
  },
  color: {
    type: String,
    default: '#2D3536'
  },
  accentColor: {
    type: String,
    default: '#B1D4D0'
  },
  bgGradient: {
    type: String,
    default: 'linear-gradient(135deg, #2D3536 0%, #1A2223 100%)'
  },
  initials: {
    type: String,
    maxlength: 3
  }
}, {
  timestamps: true
});

/* ── Auto-generate initials from fullName before saving ── */
cardSchema.pre('save', function () {
  if (this.isModified('fullName') || !this.initials) {
    var parts = (this.fullName || '').trim().split(/\s+/);
    if (parts.length >= 2) {
      this.initials = (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts[0] && parts[0].length > 0) {
      this.initials = parts[0].substring(0, 2).toUpperCase();
    } else {
      this.initials = 'IN';
    }
  }
});

/* ── Clean JSON output ── */
cardSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Card', cardSchema);
