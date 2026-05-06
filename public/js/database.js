/**
 * Database Module
 * Handles all Firestore database operations
 */

const Database = {
  /**
   * Fetch all capstone projects
   */
  async fetchProjects(filters = {}) {
    try {
      let query = db.collection('projects');
      
      // Apply filters
      if (filters.year) {
        query = query.where('year', '==', filters.year);
      }
      if (filters.program) {
        query = query.where('program', '==', filters.program);
      }
      if (filters.topic) {
        query = query.where('topics', 'array-contains', filters.topic);
      }
      
      // Order by date
      query = query.orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      const projects = [];
      
      snapshot.forEach(doc => {
        projects.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✓ Fetched ${projects.length} projects`);
      return projects;
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  /**
   * Fetch single project by ID
   */
  async fetchProjectById(projectId) {
    try {
      const doc = await db.collection('projects').doc(projectId).get();
      
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      } else {
        console.warn('Project not found:', projectId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  },

  /**
   * Search projects by keyword
   */
  async searchProjects(keyword) {
    try {
      const snapshot = await db.collection('projects').get();
      const projects = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const searchText = `${data.title} ${data.authors} ${data.abstract}`.toLowerCase();
        
        if (searchText.includes(keyword.toLowerCase())) {
          projects.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      console.log(`✓ Found ${projects.length} projects matching "${keyword}"`);
      return projects;
      
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  },

  /**
   * Add new project
   */
  async addProject(projectData) {
    try {
      const docRef = await db.collection('projects').add({
        ...projectData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✓ Project added with ID:', docRef.id);
      return docRef.id;
      
    } catch (error) {
      console.error('Error adding project:', error);
      return null;
    }
  },

  /**
   * Update project
   */
  async updateProject(projectId, updates) {
    try {
      await db.collection('projects').doc(projectId).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✓ Project updated:', projectId);
      return true;
      
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    }
  },

  /**
   * Delete project
   */
  async deleteProject(projectId) {
    try {
      await db.collection('projects').doc(projectId).delete();
      console.log('✓ Project deleted:', projectId);
      return true;
      
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  },

  /**
   * Fetch user's saved projects — returns full project objects
   */
  async fetchSavedProjects(userId) {
    // Check if user is authenticated with Firebase
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      // Fallback account - use localStorage
      return this.fetchSavedProjectsFromLocalStorage(userId);
    }
    
    try {
      const snapshot = await db.collection('savedProjects')
        .where('userId', '==', userId)
        .get();

      if (snapshot.empty) return [];

      // Collect project IDs
      const projectIds = [];
      snapshot.forEach(doc => {
        projectIds.push(doc.data().projectId);
      });

      // Fetch full project data for each ID in parallel
      const fetches = projectIds.map(pid =>
        db.collection('projects').doc(pid).get().then(projDoc => {
          if (projDoc.exists) return { id: projDoc.id, ...projDoc.data() };
          return null;
        })
      );

      const results = await Promise.all(fetches);
      return results.filter(Boolean);

    } catch (error) {
      console.error('Error fetching saved projects from Firestore:', error);
      // Fallback to localStorage
      return this.fetchSavedProjectsFromLocalStorage(userId);
    }
  },

  /**
   * Fetch saved projects from localStorage (for fallback accounts)
   */
  async fetchSavedProjectsFromLocalStorage(userId) {
    try {
      const key = `recap_saved_projects_${userId}`;
      const saved = localStorage.getItem(key);
      
      if (!saved) return [];
      
      const projectIds = JSON.parse(saved);
      
      // Fetch full project data from Firestore (projects are public)
      const fetches = projectIds.map(pid =>
        db.collection('projects').doc(pid).get().then(projDoc => {
          if (projDoc.exists) return { id: projDoc.id, ...projDoc.data() };
          return null;
        }).catch(err => {
          console.error(`Error fetching project ${pid}:`, err);
          return null;
        })
      );

      const results = await Promise.all(fetches);
      return results.filter(Boolean);
      
    } catch (error) {
      console.error('Error fetching saved projects from localStorage:', error);
      return [];
    }
  },

  /**
   * Save project for user — prevents duplicates
   */
  async saveProject(userId, projectId) {
    try {
      // Check if already saved to prevent duplicates
      const existing = await db.collection('savedProjects')
        .where('userId', '==', userId)
        .where('projectId', '==', projectId)
        .limit(1)
        .get();

      if (!existing.empty) {
        console.log('Project already saved, skipping duplicate');
        return true;
      }

      await db.collection('savedProjects').add({
        userId,
        projectId,
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('✓ Project saved');
      return true;
      
    } catch (error) {
      console.error('Error saving project:', error);
      return false;
    }
  },

  /**
   * Unsave project for user
   */
  async unsaveProject(userId, projectId) {
    try {
      const snapshot = await db.collection('savedProjects')
        .where('userId', '==', userId)
        .where('projectId', '==', projectId)
        .get();
      
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('✓ Project unsaved');
      return true;
      
    } catch (error) {
      console.error('Error unsaving project:', error);
      return false;
    }
  },

  /**
   * Get filter statistics
   */
  async getFilterStats() {
    try {
      const snapshot = await db.collection('projects').get();
      
      const stats = {
        years: {},
        programs: {},
        topics: {}
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Count years
        stats.years[data.year] = (stats.years[data.year] || 0) + 1;
        
        // Count programs
        stats.programs[data.program] = (stats.programs[data.program] || 0) + 1;
        
        // Count topics
        if (data.topics && Array.isArray(data.topics)) {
          data.topics.forEach(topic => {
            stats.topics[topic] = (stats.topics[topic] || 0) + 1;
          });
        }
      });
      
      return stats;
      
    } catch (error) {
      console.error('Error getting filter stats:', error);
      return { years: {}, programs: {}, topics: {} };
    }
  },

  /**
   * Initialize database with sample data (for testing)
   */
  async initializeSampleData() {
    try {
      const sampleProjects = [
        {
          title: "Smart Attendance Monitoring System Using Facial Recognition with Machine Learning for CTU Daanbantayan Campus",
          authors: ["Reyes, Angelo M.", "Santos, Maria C.", "Dela Cruz, Jose R."],
          adviser: "Prof. Elena Villanueva",
          year: 2024,
          program: "BSIT",
          abstract: "This study developed an attendance system utilizing facial recognition algorithms to automate student tracking. The system achieved 94.3% accuracy across varied lighting conditions and reduced manual recording time by 78%...",
          topics: ["Machine Learning", "Facial Recognition", "Computer Vision"],
          keywords: ["OpenCV", "Python", "CNN"],
          findings: "94.3% recognition accuracy, 78% reduction in attendance recording time, SUS score of 84.2"
        },
        {
          title: "IoT-Based Soil Moisture Detection System Using Arduino for Precision Agriculture in Coastal Communities",
          authors: ["Fernandez, K.", "Bautista, L."],
          adviser: "Prof. Elena Villanueva",
          year: 2024,
          program: "BSIT",
          abstract: "An IoT-enabled precision agriculture system that monitors real-time soil conditions using Arduino Mega microcontrollers and DHT22 sensors...",
          topics: ["IoT", "Hardware", "Agriculture"],
          keywords: ["Arduino", "Sensors", "Agriculture"],
          findings: "Improved irrigation efficiency by 45%, reduced water waste by 32%"
        }
      ];
      
      for (const project of sampleProjects) {
        await this.addProject(project);
      }
      
      console.log('✓ Sample data initialized');
      return true;
      
    } catch (error) {
      console.error('Error initializing sample data:', error);
      return false;
    }
  },

  /**
   * Fetch pending submissions (for adviser/librarian)
   */
  async fetchPendingSubmissions() {
    try {
      const snapshot = await db.collection('submissions')
        .where('status', '==', 'pending')
        .orderBy('submittedAt', 'desc')
        .get();
      
      const submissions = [];
      snapshot.forEach(doc => {
        submissions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✓ Fetched ${submissions.length} pending submissions`);
      return submissions;
      
    } catch (error) {
      console.error('Error fetching pending submissions:', error);
      return [];
    }
  },

  /**
   * Fetch user's submissions
   */
  async fetchUserSubmissions(userId) {
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        console.warn('⚠️ Cannot fetch submissions: User not authenticated');
        return [];
      }
      
      const snapshot = await db.collection('submissions')
        .where('submittedBy', '==', userId)
        .orderBy('submittedAt', 'desc')
        .get();
      
      const submissions = [];
      snapshot.forEach(doc => {
        submissions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✓ Fetched ${submissions.length} user submissions`);
      return submissions;
      
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      
      // If permission error, provide helpful message
      if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
        console.error('⚠️ Firestore rules not deployed! Run: firebase deploy --only firestore:rules');
      }
      
      return [];
    }
  },

  /**
   * Approve submission and move to projects collection
   */
  async approveSubmission(submissionId, validatorId, validatorName, notes = '') {
    try {
      // Get submission data
      const submissionDoc = await db.collection('submissions').doc(submissionId).get();
      
      if (!submissionDoc.exists) {
        throw new Error('Submission not found');
      }
      
      const submissionData = submissionDoc.data();
      
      // Create project from submission
      const projectData = {
        title: submissionData.title,
        authors: submissionData.authors,
        adviser: submissionData.adviser,
        year: submissionData.year,
        program: submissionData.program,
        abstract: submissionData.abstract,
        topics: submissionData.topics || [],
        keywords: submissionData.keywords || [],
        findings: submissionData.findings || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Add to projects collection
      const projectRef = await db.collection('projects').add(projectData);
      
      // Update submission status
      await db.collection('submissions').doc(submissionId).update({
        status: 'approved',
        validatedBy: validatorId,
        validatedByName: validatorName,
        validatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        validationNotes: notes,
        projectId: projectRef.id
      });
      
      console.log('✓ Submission approved and added to projects');
      return projectRef.id;
      
    } catch (error) {
      console.error('Error approving submission:', error);
      throw error;
    }
  },

  /**
   * Reject submission
   */
  async rejectSubmission(submissionId, validatorId, validatorName, notes = '') {
    try {
      await db.collection('submissions').doc(submissionId).update({
        status: 'rejected',
        validatedBy: validatorId,
        validatedByName: validatorName,
        validatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        validationNotes: notes
      });
      
      console.log('✓ Submission rejected');
      return true;
      
    } catch (error) {
      console.error('Error rejecting submission:', error);
      return false;
    }
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Database;
}
