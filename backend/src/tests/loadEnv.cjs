// Load environment variables before anything else
require('dotenv').config({ path: '.env.test' });

console.log('✅ Environment loaded from .env.test');
console.log('   DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 40) + '...');