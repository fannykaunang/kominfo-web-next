/**
 * Generate Fresh Password Hash
 * 
 * Run: node scripts/generate-hash.js
 */

const bcrypt = require('bcryptjs');

console.log('='.repeat(70));
console.log('🔐 GENERATING FRESH PASSWORD HASH');
console.log('='.repeat(70));
console.log();

const password = 'admin123';
console.log('Password:', password);
console.log();

console.log('Generating hash...');
const hash = bcrypt.hashSync(password, 10);

console.log();
console.log('✅ HASH GENERATED!');
console.log();
console.log('─'.repeat(70));
console.log(hash);
console.log('─'.repeat(70));
console.log();

// Verify hash works
const verify = bcrypt.compareSync(password, hash);
console.log('🔍 Verification Test:', verify ? '✅ PASS' : '❌ FAIL');
console.log();

console.log('📋 SQL TO UPDATE DATABASE:');
console.log('─'.repeat(70));
console.log();
console.log(`UPDATE users`);
console.log(`SET password = '${hash}'`);
console.log(`WHERE email = 'admin@meraukekab.go.id';`);
console.log();
console.log('─'.repeat(70));
console.log();

console.log('✅ STEPS:');
console.log('1. Copy SQL query above');
console.log('2. Run: mysql -u root -p merauke_portal');
console.log('3. Paste the SQL and press Enter');
console.log('4. Try login with:');
console.log('   Email: admin@meraukekab.go.id');
console.log('   Password: admin123');
console.log();
console.log('='.repeat(70));