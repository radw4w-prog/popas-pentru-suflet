const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nume: {
    type: String,
    required: [true, 'Numele este obligatoriu'],
    trim: true,
    minlength: [2, 'Numele trebuie să aibă minim 2 caractere'],
    maxlength: [50, 'Numele poate avea maxim 50 caractere']
  },
  email: {
    type: String,
    required: [true, 'Email-ul este obligatoriu'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalid']
  },
  parola: {
    type: String,
    minlength: [6, 'Parola trebuie să aibă minim 6 caractere'],
    select: false // nu se returnează parola în queries
  },
  rol: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  // Facebook OAuth
  facebookId: {
    type: String,
    default: null
  },
  facebookToken: {
    type: String,
    default: null
  },
  // Status cont
  activ: {
    type: Boolean,
    default: true
  },
  // Setări personale
  setari: {
    notificari: {
      active: { type: Boolean, default: true },
      reminderZilnic: { type: Boolean, default: true },
      milestones: { type: Boolean, default: true },
      intarziere: { type: Boolean, default: true }
    },
    tema: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark'
    }
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash parola înainte de salvare
userSchema.pre('save', async function(next) {
  // Doar dacă parola a fost modificată
  if (!this.isModified('parola')) return next();
  
  if (this.parola) {
    const salt = await bcrypt.genSalt(12);
    this.parola = await bcrypt.hash(this.parola, salt);
  }
  next();
});

// Metodă comparare parole
userSchema.methods.compareParola = async function(parolaIntrodusa) {
  return await bcrypt.compare(parolaIntrodusa, this.parola);
};

// Elimină parola din output JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.parola;
  delete obj.facebookToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);