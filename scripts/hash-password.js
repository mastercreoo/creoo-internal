#!/usr/bin/env node

/**
 * Generate bcrypt hash for a password
 * Usage: node scripts/hash-password.js "password"
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password');
  console.log('Usage: node scripts/hash-password.js "your_password"');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('\n🔐 BCRYPT HASH GENERATED:\n');
console.log(`Password: "${password}"`);
console.log(`Hash:     ${hash}`);
console.log('\n📋 SQL UPDATE STATEMENT:\n');
console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'admin@creoai.studio';\n`);
