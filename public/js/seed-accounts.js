/**
 * Seed Default Accounts
 * Run this ONCE from the browser console: SeedAccounts.run()
 * Creates default Firebase Auth + Firestore profiles for demo accounts.
 * Safe to run multiple times — skips accounts that already exist.
 */

const SeedAccounts = {
  accounts: [
    {
      email: 'admin@ctu.edu.ph',
      password: 'admin123',
      profile: {
        name: 'Admin User',
        role: 'admin',
        department: 'System Administration',
        program: 'N/A',
        studentId: 'ADM-001',
      }
    },
    {
      email: 'librarian@ctu.edu.ph',
      password: 'librarian123',
      profile: {
        name: 'Ms. Maria Santos',
        role: 'librarian',
        department: 'Library Services',
        program: 'N/A',
        studentId: 'LIB-001',
      }
    },
    {
      email: 'adviser@ctu.edu.ph',
      password: 'adviser123',
      profile: {
        name: 'Prof. Elena Villanueva',
        role: 'adviser',
        department: 'Computer Science',
        program: 'N/A',
        studentId: 'ADV-001',
      }
    },
    {
      email: 'student@ctu.edu.ph',
      password: 'student123',
      profile: {
        name: 'Juan dela Cruz',
        role: 'student',
        program: 'BSIT 3A',
        studentId: '2021-12345',
        department: '',
      }
    }
  ],

  async run() {
    console.log('Starting account seed...');
    let created = 0;
    let skipped = 0;

    for (const account of this.accounts) {
      try {
        // Try to create the Firebase Auth account
        const credential = await auth.createUserWithEmailAndPassword(
          account.email,
          account.password
        );

        // Save profile to Firestore
        await db.collection('users').doc(credential.user.uid).set({
          ...account.profile,
          email: account.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        // Sign out immediately so we don't stay logged in as this user
        await auth.signOut();

        console.log(`✓ Created: ${account.email} (${account.profile.role})`);
        created++;

      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`— Skipped (already exists): ${account.email}`);
          skipped++;
        } else {
          console.error(`✗ Failed: ${account.email}`, error.message);
        }
      }
    }

    console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
    console.log('You can now log in with any of the demo accounts.');
  }
};

// Make available globally
window.SeedAccounts = SeedAccounts;
