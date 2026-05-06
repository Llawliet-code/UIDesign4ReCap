/**
 * Diagnostic Tool for Submission Issues
 * Run this in browser console to diagnose submission problems
 */

window.runDiagnostics = function() {
  console.log('🔍 Running CTU RECAP Diagnostics...\n');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Test 1: Firebase SDK Loaded
  console.log('Test 1: Checking Firebase SDK...');
  if (typeof firebase !== 'undefined') {
    results.passed.push('✅ Firebase SDK is loaded');
    console.log('✅ Firebase SDK is loaded');
  } else {
    results.failed.push('❌ Firebase SDK is NOT loaded');
    console.error('❌ Firebase SDK is NOT loaded');
  }
  
  // Test 2: Firestore Initialized
  console.log('\nTest 2: Checking Firestore...');
  if (typeof db !== 'undefined' && db !== null) {
    results.passed.push('✅ Firestore database is initialized');
    console.log('✅ Firestore database is initialized');
  } else {
    results.failed.push('❌ Firestore database is NOT initialized');
    console.error('❌ Firestore database is NOT initialized');
  }
  
  // Test 3: Auth Module
  console.log('\nTest 3: Checking Auth module...');
  if (typeof Auth !== 'undefined') {
    results.passed.push('✅ Auth module is loaded');
    console.log('✅ Auth module is loaded');
    
    // Test 3a: User Login Status
    if (Auth.currentUser) {
      results.passed.push(`✅ User is logged in as: ${Auth.currentUser.name} (${Auth.currentUser.role})`);
      console.log(`✅ User is logged in as: ${Auth.currentUser.name}`);
      console.log(`   - User ID: ${Auth.currentUser.id}`);
      console.log(`   - Role: ${Auth.currentUser.role}`);
      console.log(`   - Email: ${Auth.currentUser.email || 'N/A'}`);
    } else {
      results.failed.push('❌ User is NOT logged in');
      console.error('❌ User is NOT logged in');
    }
  } else {
    results.failed.push('❌ Auth module is NOT loaded');
    console.error('❌ Auth module is NOT loaded');
  }
  
  // Test 4: StudentUpload Module
  console.log('\nTest 4: Checking StudentUpload module...');
  if (typeof StudentUpload !== 'undefined') {
    results.passed.push('✅ StudentUpload module is loaded');
    console.log('✅ StudentUpload module is loaded');
  } else {
    results.failed.push('❌ StudentUpload module is NOT loaded');
    console.error('❌ StudentUpload module is NOT loaded');
  }
  
  // Test 5: Form Elements
  console.log('\nTest 5: Checking form elements...');
  const form = document.getElementById('upload-metadata-form');
  if (form) {
    results.passed.push('✅ Upload form exists');
    console.log('✅ Upload form exists');
    
    const requiredFields = [
      'upload-title',
      'upload-authors',
      'upload-adviser',
      'upload-year',
      'upload-program',
      'upload-abstract'
    ];
    
    let allFieldsExist = true;
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field) {
        results.failed.push(`❌ Field missing: ${fieldId}`);
        console.error(`❌ Field missing: ${fieldId}`);
        allFieldsExist = false;
      }
    });
    
    if (allFieldsExist) {
      results.passed.push('✅ All required form fields exist');
      console.log('✅ All required form fields exist');
    }
  } else {
    results.failed.push('❌ Upload form does NOT exist');
    console.error('❌ Upload form does NOT exist');
  }
  
  // Test 6: Firebase Connection
  console.log('\nTest 6: Testing Firebase connection...');
  if (typeof db !== 'undefined' && db !== null) {
    db.collection('projects').limit(1).get()
      .then(() => {
        results.passed.push('✅ Firebase connection successful');
        console.log('✅ Firebase connection successful');
        printSummary();
      })
      .catch(err => {
        results.failed.push(`❌ Firebase connection failed: ${err.message}`);
        console.error('❌ Firebase connection failed:', err);
        printSummary();
      });
  } else {
    results.warnings.push('⚠️ Skipping connection test (Firestore not initialized)');
    console.warn('⚠️ Skipping connection test (Firestore not initialized)');
    printSummary();
  }
  
  function printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 DIAGNOSTIC SUMMARY');
    console.log('='.repeat(60));
    
    if (results.passed.length > 0) {
      console.log('\n✅ PASSED TESTS:');
      results.passed.forEach(msg => console.log('  ' + msg));
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      results.warnings.forEach(msg => console.log('  ' + msg));
    }
    
    if (results.failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      results.failed.forEach(msg => console.log('  ' + msg));
      
      console.log('\n' + '='.repeat(60));
      console.log('🔧 RECOMMENDED ACTIONS:');
      console.log('='.repeat(60));
      
      if (results.failed.some(f => f.includes('Firebase SDK'))) {
        console.log('\n1. Firebase SDK not loaded:');
        console.log('   - Refresh the page (F5)');
        console.log('   - Check internet connection');
        console.log('   - Disable ad blockers');
        console.log('   - Try incognito/private mode');
      }
      
      if (results.failed.some(f => f.includes('Firestore database'))) {
        console.log('\n2. Firestore not initialized:');
        console.log('   - Check firebase-config.js exists');
        console.log('   - Verify Firebase configuration');
        console.log('   - Refresh the page');
      }
      
      if (results.failed.some(f => f.includes('NOT logged in'))) {
        console.log('\n3. User not logged in:');
        console.log('   - Click "Login" button');
        console.log('   - Enter your credentials');
        console.log('   - Wait for login to complete');
      }
      
      if (results.failed.some(f => f.includes('connection failed'))) {
        console.log('\n4. Firebase connection failed:');
        console.log('   - Check internet connection');
        console.log('   - Check Firebase status: https://status.firebase.google.com/');
        console.log('   - Disable VPN if active');
        console.log('   - Check firewall settings');
      }
    } else {
      console.log('\n✅ All tests passed! System is ready for submissions.');
      console.log('\nIf you still get errors when submitting:');
      console.log('1. Fill out the form completely');
      console.log('2. Open Console tab (F12)');
      console.log('3. Click Submit');
      console.log('4. Look for error messages with ❌ icon');
      console.log('5. Share the error message for further help');
    }
    
    console.log('\n' + '='.repeat(60));
  }
};

// Auto-run on load
console.log('💡 Diagnostic tool loaded!');
console.log('💡 Run "runDiagnostics()" in console to check system status');
