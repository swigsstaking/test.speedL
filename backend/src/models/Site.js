import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Site slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  logo: {
    url: {
      type: String,
    },
    alt: {
      type: String,
      default: 'Logo',
    },
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#dc2626',
    },
    secondaryColor: {
      type: String,
      default: '#1f2937',
    },
    fontFamily: {
      type: String,
      default: 'Helvetica Neue, Arial, sans-serif',
    },
  },
  contact: {
    phone: String,
    email: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    whatsapp: String,
  },
  social: {
    facebook: String,
    instagram: String,
    tiktok: String,
    linkedin: String,
    twitter: String,
  },
  settings: {
    language: {
      type: String,
      default: 'fr',
    },
    timezone: {
      type: String,
      default: 'Europe/Zurich',
    },
    analytics: {
      googleAnalyticsId: String,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Site', siteSchema);
