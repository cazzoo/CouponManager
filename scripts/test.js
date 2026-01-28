console.log('Test script starting...');

const args = process.argv.slice(2);
console.log('Arguments:', args);

console.log('Environment variables loaded:');
console.log('  VITE_POCKETBASE_URL:', process.env.VITE_POCKETBASE_URL);
console.log('  PB_ADMIN_EMAIL:', process.env.PB_ADMIN_EMAIL);
console.log('  PB_ADMIN_PASSWORD:', process.env.PB_ADMIN_PASSWORD ? '***' : 'not set');

console.log('Script completed successfully');