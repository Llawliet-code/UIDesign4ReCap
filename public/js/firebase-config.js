/**
 * Firebase Configuration
 * Initialize Firebase and Firestore
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-cx4ujJ2RUq6TZ8fUaNetft05OuTW4vk",
  authDomain: "re-caps.firebaseapp.com",
  projectId: "re-caps",
  storageBucket: "re-caps.firebasestorage.app",
  messagingSenderId: "801454732856",
  appId: "1:801454732856:web:b43d5e06c04a209d1918cd"
};

// Initialize Firebase
let app, auth, db;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  
  console.log('✓ Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.firebaseApp = app;
  window.firebaseAuth = auth;
  window.firebaseDB = db;
}
