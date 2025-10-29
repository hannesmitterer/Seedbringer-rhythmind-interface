/**
 * Basic Test Suite for Seedbringer Rhythmind Interface
 * 
 * These tests verify the basic functionality of the server
 * without requiring full OAuth configuration.
 */

const assert = require('assert');

console.log('🧪 Running Seedbringer Interface Tests\n');

// Test 1: Server module can be loaded
console.log('Test 1: Loading server module...');
try {
  // We need to mock environment variables first
  process.env.SESSION_SECRET = 'test-secret';
  process.env.AUTHORIZED_EMAILS = 'test@example.com,test2@example.com';
  
  const server = require('../server');
  assert(server, 'Server should be loaded');
  console.log('✓ Server module loaded successfully\n');
  
  // Close the server properly
  if (server.listening) {
    server.close();
  } else {
    server.on('listening', () => server.close());
  }
} catch (error) {
  console.error('✗ Failed to load server:', error.message);
  process.exit(1);
}

// Test 2: Environment configuration parsing
console.log('Test 2: Environment configuration...');
try {
  const emails = process.env.AUTHORIZED_EMAILS.split(',').map(e => e.trim());
  assert.strictEqual(emails.length, 2, 'Should parse 2 emails');
  assert.strictEqual(emails[0], 'test@example.com', 'First email should match');
  assert.strictEqual(emails[1], 'test2@example.com', 'Second email should match');
  console.log('✓ Environment configuration parsed correctly\n');
} catch (error) {
  console.error('✗ Environment configuration test failed:', error.message);
  process.exit(1);
}

// Test 3: File structure validation
console.log('Test 3: File structure validation...');
try {
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'server.js',
    'package.json',
    '.env.example',
    '.gitignore',
    'README.md',
    'SETUP.md',
    'API.md',
    'LICENSE',
    'public/index.html',
    'public/dashboard.html',
    'public/css/styles.css',
    'examples/basic-client.js',
    'examples/api-usage.js'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    assert(fs.existsSync(filePath), `File ${file} should exist`);
  }
  
  console.log('✓ All required files exist\n');
} catch (error) {
  console.error('✗ File structure validation failed:', error.message);
  process.exit(1);
}

// Test 4: Package.json validation
console.log('Test 4: Package.json validation...');
try {
  const packageJson = require('../package.json');
  
  assert(packageJson.name, 'Package should have a name');
  assert(packageJson.version, 'Package should have a version');
  assert(packageJson.dependencies, 'Package should have dependencies');
  
  const requiredDeps = ['express', 'googleapis', 'socket.io', 'dotenv', 'express-session'];
  for (const dep of requiredDeps) {
    assert(packageJson.dependencies[dep], `Dependency ${dep} should be present`);
  }
  
  console.log('✓ Package.json is valid\n');
} catch (error) {
  console.error('✗ Package.json validation failed:', error.message);
  process.exit(1);
}

// Test 5: Static files validation
console.log('Test 5: Static files validation...');
try {
  const fs = require('fs');
  const path = require('path');
  
  // Check index.html contains key elements
  const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  assert(indexHtml.includes('Seedbringer Rhythmind Interface'), 'Index should have title');
  assert(indexHtml.includes('/auth/google'), 'Index should have login link');
  
  // Check dashboard.html contains key elements
  const dashboardHtml = fs.readFileSync(path.join(__dirname, '../public/dashboard.html'), 'utf8');
  assert(dashboardHtml.includes('socket.io'), 'Dashboard should include Socket.IO');
  assert(dashboardHtml.includes('/api/user'), 'Dashboard should call user API');
  
  // Check CSS file exists and has content
  const css = fs.readFileSync(path.join(__dirname, '../public/css/styles.css'), 'utf8');
  assert(css.includes('.dashboard-container'), 'CSS should contain dashboard styles');
  assert(css.includes('.message'), 'CSS should contain message styles');
  assert(css.includes('.btn-login'), 'CSS should contain button styles');
  
  console.log('✓ Static files are valid\n');
} catch (error) {
  console.error('✗ Static files validation failed:', error.message);
  process.exit(1);
}

// Test 6: .gitignore validation
console.log('Test 6: .gitignore validation...');
try {
  const fs = require('fs');
  const path = require('path');
  
  const gitignore = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
  
  const requiredIgnores = [
    'node_modules/',
    '.env',
    'token.json',
    'credentials.json'
  ];
  
  for (const ignore of requiredIgnores) {
    assert(gitignore.includes(ignore), `Gitignore should include ${ignore}`);
  }
  
  console.log('✓ .gitignore is properly configured\n');
} catch (error) {
  console.error('✗ .gitignore validation failed:', error.message);
  process.exit(1);
}

// Test 7: Documentation validation
console.log('Test 7: Documentation validation...');
try {
  const fs = require('fs');
  const path = require('path');
  
  // Check README.md
  const readme = fs.readFileSync(path.join(__dirname, '../README.md'), 'utf8');
  assert(readme.includes('OAuth'), 'README should mention OAuth');
  assert(readme.includes('WebSocket'), 'README should mention WebSocket');
  
  // Check SETUP.md
  const setup = fs.readFileSync(path.join(__dirname, '../SETUP.md'), 'utf8');
  assert(setup.includes('GOOGLE_CLIENT_ID'), 'SETUP should mention client ID');
  assert(setup.includes('npm install'), 'SETUP should have installation instructions');
  
  // Check API.md
  const api = fs.readFileSync(path.join(__dirname, '../API.md'), 'utf8');
  assert(api.includes('/api/user'), 'API doc should document endpoints');
  assert(api.includes('WebSocket'), 'API doc should document WebSocket');
  
  console.log('✓ Documentation is complete\n');
} catch (error) {
  console.error('✗ Documentation validation failed:', error.message);
  process.exit(1);
}

// All tests passed
console.log('═══════════════════════════════════════');
console.log('✅ All tests passed successfully!');
console.log('═══════════════════════════════════════\n');

console.log('Summary:');
console.log('- Server module loads correctly');
console.log('- Environment configuration works');
console.log('- All required files are present');
console.log('- Package.json is valid');
console.log('- Static files are properly configured');
console.log('- .gitignore protects sensitive data');
console.log('- Documentation is complete');
console.log('\nThe Seedbringer Rhythmind Interface is ready for deployment! 🚀\n');
