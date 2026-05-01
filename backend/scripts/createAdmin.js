require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const ADMIN_EMAIL = 'radw4w@popas.ro';
const ADMIN_NUME = 'radw4w';
const ADMIN_PAROLA = '4pNkU@u,24';

const createAdmin = async () => {
  try {
    console.log('🔌 Conectare la MongoDB...');
    
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/popas-pentru-suflet'
    );
    
    console.log('✅ Conectat la MongoDB');

    // Verifică dacă există deja
    const existent = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existent) {
      console.log('⚠️  Admin există deja!');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Rol: ${existent.rol}`);
      await mongoose.disconnect();
      return;
    }

    // Creează admin
    const admin = await User.create({
      nume: ADMIN_NUME,
      email: ADMIN_EMAIL,
      parola: ADMIN_PAROLA,
      rol: 'admin',
      activ: true,
      lastLogin: new Date()
    });

    console.log('');
    console.log('✅ ================================');
    console.log('✅  ADMIN CREAT CU SUCCES!');
    console.log('✅ ================================');
    console.log(`   Nume:   ${ADMIN_NUME}`);
    console.log(`   Email:  ${ADMIN_EMAIL}`);
    console.log(`   Parolă: ${ADMIN_PAROLA}`);
    console.log(`   Rol:    admin`);
    console.log(`   ID:     ${admin._id}`);
    console.log('');
    console.log('⚠️  IMPORTANT: Salvează aceste date în siguranță!');

  } catch (error) {
    console.error('❌ Eroare:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Deconectat MongoDB');
    process.exit(0);
  }
};

createAdmin();