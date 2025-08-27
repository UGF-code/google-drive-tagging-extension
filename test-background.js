// Test script for new background script architecture
// Run this in the browser console to test message handling

console.log('🧪 Testing new background script architecture...');

// Test 1: Check Authentication
async function testAuth() {
  console.log('🔐 Testing authentication...');
  
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'checkAuth'
      }, resolve);
    });
    
    console.log('Auth check response:', response);
    return response.success && response.authenticated;
  } catch (error) {
    console.error('Auth test failed:', error);
    return false;
  }
}

// Test 2: Test Get Tags (with a sample file ID)
async function testGetTags() {
  console.log('🏷️ Testing get tags...');
  
  // Use a sample file ID (this won't work unless you have access to this file)
  const sampleFileId = '1UYDcNdSlq0MvO4tiNfKFvaqohbxST7L085zjXCI8OM8';
  
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'getTags',
        fileId: sampleFileId
      }, resolve);
    });
    
    console.log('Get tags response:', response);
    return response.success;
  } catch (error) {
    console.error('Get tags test failed:', error);
    return false;
  }
}

// Test 3: Test Add Tag
async function testAddTag() {
  console.log('➕ Testing add tag...');
  
  const sampleFileId = '1UYDcNdSlq0MvO4tiNfKFvaqohbxST7L085zjXCI8OM8';
  const testTag = 'test-tag-' + Date.now();
  
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'addTag',
        fileId: sampleFileId,
        tag: testTag
      }, resolve);
    });
    
    console.log('Add tag response:', response);
    return response.success;
  } catch (error) {
    console.error('Add tag test failed:', error);
    return false;
  }
}

// Test 4: Test Message Validation
async function testMessageValidation() {
  console.log('✅ Testing message validation...');
  
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        // Missing action parameter
      }, resolve);
    });
    
    console.log('Message validation response:', response);
    return !response.success && response.error.includes('Missing action');
  } catch (error) {
    console.error('Message validation test failed:', error);
    return false;
  }
}

// Test 5: Test Unknown Action
async function testUnknownAction() {
  console.log('❓ Testing unknown action...');
  
  try {
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'unknownAction'
      }, resolve);
    });
    
    console.log('Unknown action response:', response);
    return !response.success && response.error.includes('Unknown action');
  } catch (error) {
    console.error('Unknown action test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting background script tests...\n');
  
  const tests = [
    { name: 'Message Validation', fn: testMessageValidation },
    { name: 'Unknown Action', fn: testUnknownAction },
    { name: 'Authentication Check', fn: testAuth },
    { name: 'Get Tags', fn: testGetTags },
    { name: 'Add Tag', fn: testAddTag }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
    console.log(`${result ? '✅ PASSED' : '❌ FAILED'}: ${test.name}`);
  }
  
  console.log('\n📊 Test Results:');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Background script is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Check the console for details.');
  }
}

// Export for use in console
window.testBackgroundScript = runAllTests;
console.log('💡 Run testBackgroundScript() to test the new background script');
