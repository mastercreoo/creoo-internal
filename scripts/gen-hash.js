#!/usr/bin/env node

/**
 * Generate bcrypt hash for password
 * Usage: node scripts/gen-hash.js "your_password_here"
 * Example: node scripts/gen-hash.js "admin123"
 */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password');
  console.log('Usage: node scripts/gen-hash.js "your_password"');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('\n🔐 Bcrypt Hash Generated:');
console.log('─'.repeat(80));
console.log(`Password: "${password}"`);
console.log(`Hash:     ${hash}`);
console.log('─'.repeat(80));
console.log('\n✅ Use this hash in your INSERT statement:');
console.log(`\nINSERT INTO users (name, email, password_hash, role)`);
console.log(`VALUES ('Admin User', 'admin@creoai.studio', '${hash}', 'admin')`);
console.log(`ON CONFLICT (email) DO UPDATE SET password_hash = '${hash}';\n`);
