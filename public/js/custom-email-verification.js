/**
 * Custom Email Verification System
 * Sends verification emails to linked Gmail instead of CTU email
 */

const CustomEmailVerification = {
  /**
   * Generate a verification token
   */
  generateVerificationToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  /**
   * Send verification email to linked Gmail
   * @param {string} userId - Firebase user ID
   * @param {string} ctuEmail - CTU email address
   * @param {string} gmail - Linked Gmail address
   * @param {string} userName - User's name
   */
  async sendVerificationEmail(userId, ctuEmail, gmail, userName) {
    try {
      // Generate verification token
      const token = this.generateVerificationToken();
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      // Store verification token in Firestore
      await db.collection('email_verifications').doc(userId).set({
        userId: userId,
        ctuEmail: ctuEmail.toLowerCase(),
        gmail: gmail.toLowerCase(),
        token: token,
        verified: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        expiresAt: expiresAt
      });

      // Create verification link
      const verificationLink = `${window.location.origin}/verify.html?token=${token}&uid=${userId}`;

      // Check if EmailJS is available
      if (typeof emailjs !== 'undefined') {
        // Send email using EmailJS
        const templateParams = {
          to_email: gmail,
          to_name: userName,
          from_name: 'RECAP System',
          verification_link: verificationLink,
          ctu_email: ctuEmail
        };

        try {
          // TODO: Replace with your EmailJS IDs
          await emailjs.send(
            'YOUR_SERVICE_ID',      // Replace with your EmailJS service ID
            'YOUR_TEMPLATE_ID',     // Replace with your EmailJS template ID
            templateParams
          );

          console.log('✅ Verification email sent successfully to:', gmail);
        } catch (emailError) {
          console.error('❌ EmailJS error:', emailError);
          console.log('⚠️ Email not sent, but verification link created');
        }
      } else {
        console.warn('⚠️ EmailJS not loaded. Email not sent.');
        console.log('📝 To enable email sending, follow instructions in SETUP_EMAILJS.md');
      }

      // Log verification data for manual testing
      console.log('📧 Verification email data:', {
        to: gmail,
        name: userName,
        link: verificationLink
      });
      console.log('🔗 Verification link:', verificationLink);
      console.log('📋 Copy this link to verify manually (until EmailJS is set up)');

      // Return success
      return {
        success: true,
        token: token,
        verificationLink: verificationLink,
        gmail: gmail
      };

    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  },

  /**
   * Verify the token
   * @param {string} token - Verification token
   * @param {string} userId - User ID
   */
  async verifyToken(token, userId) {
    try {
      // Get verification document
      const verificationDoc = await db.collection('email_verifications').doc(userId).get();

      if (!verificationDoc.exists) {
        throw new Error('Verification record not found');
      }

      const data = verificationDoc.data();

      // Check if already verified
      if (data.verified) {
        return { success: true, message: 'Email already verified' };
      }

      // Check if token matches
      if (data.token !== token) {
        throw new Error('Invalid verification token');
      }

      // Check if expired
      if (Date.now() > data.expiresAt) {
        throw new Error('Verification link has expired');
      }

      // Mark as verified
      await db.collection('email_verifications').doc(userId).update({
        verified: true,
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Update user profile
      await db.collection('users').doc(userId).update({
        emailVerified: true,
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, message: 'Email verified successfully' };

    } catch (error) {
      console.error('Error verifying token:', error);
      throw error;
    }
  },

  /**
   * Check if user's email is verified
   * @param {string} userId - User ID
   */
  async isEmailVerified(userId) {
    try {
      const verificationDoc = await db.collection('email_verifications').doc(userId).get();
      
      if (!verificationDoc.exists) {
        return false;
      }

      return verificationDoc.data().verified === true;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  },

  /**
   * Resend verification email
   * @param {string} userId - User ID
   */
  async resendVerificationEmail(userId) {
    try {
      // Get user data
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();

      // Send new verification email
      return await this.sendVerificationEmail(
        userId,
        userData.email,
        userData.linkedGmail,
        userData.name
      );

    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  }
};

// Make it globally available
window.CustomEmailVerification = CustomEmailVerification;
