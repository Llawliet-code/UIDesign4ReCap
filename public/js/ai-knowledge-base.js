/**
 * AI Knowledge Base
 * Contains accurate information about the RECAP system for AI responses
 */

const AIKnowledgeBase = {
  // System Information
  system: {
    name: "RECAP (Repository for Capstone Projects)",
    fullName: "AI-Integrated Capstone Metadata Repository with Intelligent Search and Chatbot Assistance",
    institution: "CTU Daanbantayan Campus",
    purpose: "Digital repository for storing, searching, and managing capstone project metadata",
    features: [
      "AI-powered semantic search",
      "Intelligent chatbot assistance",
      "Role-based access control",
      "Conversation history management",
      "FAIR principles compliance",
      "Citation generation"
    ]
  },

  // User Roles and Permissions
  roles: {
    student: {
      name: "Student",
      permissions: [
        "Search and browse capstone projects",
        "View project details",
        "Save favorite projects",
        "Generate citations",
        "Use AI chatbot",
        "Submit capstone metadata (requires adviser approval)"
      ],
      cannotDo: [
        "Approve or reject submissions",
        "Delete projects",
        "Access admin panel",
        "Manage user accounts"
      ]
    },
    
    librarian: {
      name: "Librarian",
      permissions: [
        "All student permissions",
        "Upload capstone metadata directly",
        "View recent uploads",
        "Manage library records",
        "Assist users with searches"
      ],
      cannotDo: [
        "Approve student submissions",
        "Delete projects without admin approval",
        "Access full admin panel"
      ]
    },
    admin: {
      name: "Administrator",
      permissions: [
        "Full system access",
        "Manage all projects (add, edit, delete)",
        "View system statistics",
        "Manage user accounts",
        "Configure system settings",
        "Access all features"
      ],
      cannotDo: []
    },
    guest: {
      name: "Guest (Not Logged In)",
      permissions: [
        "Search and browse projects",
        "View project details",
        "Use AI chatbot (temporary session)",
        "Generate citations"
      ],
      cannotDo: [
        "Save favorite projects",
        "Submit capstone metadata",
        "Access dashboard",
        "Save conversation history"
      ],
      note: "Conversations are not saved. Login required to save chat history."
    }
  },

  // Programs Available
  programs: [
    { code: "BSIT", name: "Bachelor of Science in Information Technology" },
    { code: "BSIE", name: "Bachelor of Science in Industrial Engineering" }
  ],

  // Common Research Topics
  topics: {
    technology: [
      "Machine Learning",
      "Artificial Intelligence",
      "Internet of Things (IoT)",
      "Web Development",
      "Mobile Applications",
      "Data Analytics",
      "Cybersecurity",
      "Cloud Computing",
      "Blockchain",
      "Computer Vision"
    ],
    education: [
      "Teaching Methods",
      "Educational Technology",
      "Curriculum Development",
      "Student Assessment",
      "Learning Management Systems"
    ],
    agriculture: [
      "Smart Farming",
      "Crop Management",
      "Agricultural IoT",
      "Sustainable Agriculture",
      "Farm Management Systems"
    ]
  },

  // How-To Guides
  howTo: {
    search: {
      question: "How do I search for capstone projects?",
      answer: `**Searching for Projects:**

1. **Basic Search:**
   - Go to the Search/Landing tab
   - Enter keywords in the search bar (e.g., "IoT", "Machine Learning", "Arduino")
   - Press Enter or click the search icon

2. **Advanced Search:**
   - Use filters on the left sidebar:
     • **Program**: Filter by BSIT, BSIE
     • **Year**: Select specific year or range
     • **Topics**: Choose research topics
   - Click "Apply Filters"

3. **AI Semantic Search:**
   - Toggle "AI Semantic Search" for intelligent results
   - Ask natural language questions like:
     • "Show me IoT projects from 2024 using Arduino"
     • "Find machine learning projects in agriculture"

4. **Sort Results:**
   - Use the sort dropdown: Relevance, Newest, Oldest, Title A-Z`
    },

    submit: {
      question: "How Do I Can Submit My Final Deliverable Capstone Project",
      answer: `**Submitting Your Capstone (Students Only):**

**Prerequisites:**
- You must be logged in as a Student
- Have your project metadata ready

**Steps:**
1. **Login** to your student account
2. Go to **Dashboard** tab
3. Click **"Submit Capstone Metadata"** button
4. Fill in the required fields:
   - Project Title
   - Authors (your group members)
   - Adviser Name
   - Program (BSIT, BSIE, etc.)
   - Year
   - Abstract
   - Keywords/Topics

5. Click **"Submit for Validation"**

**What Happens Next:**
- If approved: Project appears in the repository
- If rejected: You'll receive feedback that your physical book is not yet pass to library for verification

**Note:** Librarians can upload directly without approval.`
    },

    save: {
      question: "How do I save favorite projects?",
      answer: `**Saving Favorite Projects:**

**Requirements:**
- You must be logged in (any role except Guest)

**Steps:**
1. Search for projects
2. Click on a project card to view details
3. Click the **"Save"** or **bookmark icon** button
4. Project is added to your Dashboard

**View Saved Projects:**
1. Go to **Dashboard** tab
2. Your role tab (Student/Librarian)
3. See "Saved Projects" section

**Remove Saved Projects:**
- Click the bookmark icon again to unsave

**Guest Users:**
- Cannot save projects
- Must login to use this feature`
    },

    citation: {
      question: "How do I generate a citation?",
      answer: `**Generating Citations:**

1. **Find the Project:**
   - Search for the project you want to cite
   - Click to view project details

2. **Generate Citation:**
   - Click **"Cite"** or **citation icon** button
   - Citation modal appears

3. **Choose Format:**
   - **APA** (American Psychological Association)
   - **MLA** (Modern Language Association)
   - **Chicago** style

4. **Copy Citation:**
   - Click **"Copy"** button
   - Citation is copied to clipboard
   - Paste into your document

**Citation Includes:**
- Authors
- Year
- Title
- Institution (CTU Daanbantayan Campus)
- Repository name (RECAPS)

**Available to:** All users (including guests)`
    },

    chatbot: {
      question: "How do I use the AI chatbot?",
      answer: `**Using the AI Chatbot:**

**Access Methods:**
1. **AI Chatbot Tab** - Full-screen chat interface
2. **Floating Chat Button** - Click the chat icon (bottom-right)

**For Logged-In Users:**
- Conversations are automatically saved
- Access up to 3 conversation histories
- Switch between conversations
- Delete old conversations

**For Guest Users:**
1. Click **"Start Chatting"** button
2. Chat in temporary session
3. **Warning:** Conversations NOT saved
4. Login to save chat history

**What Can the Chatbot Do:**
- Answer questions about the repository
- Help with searches
- Explain how to use features
- Provide information about projects
- Guide you through processes

**Example Questions:**
- "How do I upload my abstract?"
- "Show me IoT projects from 2024"
- "What programs are available?"
- "How do I cite a project?"`
    },

    conversations: {
      question: "How do conversation histories work?",
      answer: `**Conversation History (Logged-In Users Only):**

**Features:**
- Save up to **3 conversations**
- Auto-saves as you chat
- Syncs to cloud (if using Firebase)
- Access from any device

**Managing Conversations:**

1. **View Conversations:**
   - Click the grid icon in chat header
   - See list of conversations with:
     • Title (from first message)
     • Message count
     • Last updated time

2. **Create New Conversation:**
   - Click **"New Conversation"** button
   - Limit: 3 conversations max
   - Delete old ones to create new

3. **Switch Conversations:**
   - Click on any conversation in the list
   - Chat history loads automatically

4. **Delete Conversations:**
   - Click trash icon on conversation
   - Confirm deletion
   - Cannot be undone

**Guest Users:**
- No conversation history
- Temporary session only
- Login to save conversations`
    },

    fairPrinciples: {
      question: "What are FAIR principles?",
      answer: `**FAIR Principles in RECAP:**

FAIR stands for:

**F - Findable:**
- Projects have unique identifiers
- Rich metadata for easy discovery
- AI-powered semantic search
- Keyword and topic indexing

**A - Accessible:**
- Open access to all users
- No barriers to viewing projects
- Multiple search methods
- Guest access available

**I - Interoperable:**
- Standard metadata format
- Compatible citation formats (APA, MLA, Chicago)
- Structured data storage
- API-ready architecture

**R - Reusable:**
- Clear licensing information
- Detailed project descriptions
- Complete author attribution
- Proper citation generation

**Why FAIR Matters:**
- Increases research visibility
- Enables knowledge sharing
- Supports academic integrity
- Facilitates collaboration`
    }
  },

  // Common Issues and Solutions
  troubleshooting: {
    cannotLogin: {
      issue: "Cannot login to account",
      solutions: [
        "Check email and password are correct",
        "Ensure Caps Lock is off",
        "Try 'Forgot Password' to reset",
        "Contact system administrator if issue persists",
        "Demo accounts available: student@ctu.edu.ph / CTU@Stud2024!"
      ]
    },
    noResults: {
      issue: "Search returns no results",
      solutions: [
        "Try different keywords or synonyms",
        "Remove some filters to broaden search",
        "Check spelling of search terms",
        "Use AI Semantic Search for better matching",
        "Try searching by author name or year"
      ]
    },
    chatbotNotResponding: {
      issue: "AI chatbot not responding",
      solutions: [
        "Check internet connection",
        "Verify API keys are configured (admin)",
        "Refresh the page and try again",
        "Check browser console for errors",
        "Contact administrator if problem continues"
      ]
    },
    conversationNotSaving: {
      issue: "Conversations not being saved",
      solutions: [
        "Ensure you are logged in (not guest)",
        "Check if you've reached 3 conversation limit",
        "Verify browser allows localStorage",
        "Try logging out and back in",
        "Check Firebase connection (if applicable)"
      ]
    }
  },

  // System Limits
  limits: {
    conversations: {
      max: 3,
      description: "Maximum number of saved conversations per user"
    },
    searchResults: {
      perPage: 20,
      description: "Number of results shown per page"
    },
    fileUpload: {
      maxSize: "10MB",
      formats: ["PDF", "DOCX"],
      description: "Maximum file size and supported formats for uploads"
    }
  },

  // Contact and Support
  support: {
    email: "library@ctu.edu.ph",
    phone: "(032) XXX-XXXX",
    office: "CTU Daanbantayan Campus Library",
    hours: "Monday-Friday, 8:00 AM - 5:00 PM"
  },

  /**
   * Direct Answer Routes
   * Simple, human-friendly answers that bypass LLM
   */
  directAnswers: {
    // Greetings
    "hi": "Hi there! 👋 I'm your RECAP assistant. I can help you search for capstone projects, learn how to use the system, or answer questions about CTU's repository. What would you like to know?",
    "hello": "Hello! 👋 Welcome to RECAP! I'm here to help you find capstone projects or learn how to use the system. What can I help you with?",
    "hey": "Hey! 👋 I'm your RECAP assistant. Ask me anything about searching projects, submitting your capstone, or using the system!",
    
    // Search Questions
    "how do i search": "**Searching is easy!**\n\n1. Type keywords in the search bar (like 'IoT' or 'Machine Learning')\n2. Use filters on the left to narrow results by program or year\n3. Click on any project to see full details\n\n**Tip:** Turn on 'AI Semantic Search' for smarter results!",
    
    "how to search": "**Here's how to search:**\n\n1. Enter keywords in the search bar\n2. Press Enter or click the search icon\n3. Use filters to refine results\n4. Click any project card to view details\n\nTry searching for topics like 'Arduino', 'Web App', or 'Agriculture'!",
    
    "how to find projects": "**Finding projects is simple:**\n\n1. Go to the Search tab\n2. Type what you're looking for (e.g., 'IoT projects')\n3. Apply filters for program (BSIT, BSIE, etc.) or year\n4. Browse results and click to view details\n\nYou can also use AI Semantic Search for natural language queries!",
    
    // Submit Questions
    "how do i submit": "**To submit your capstone:**\n\n1. **Login** as a student\n2. Go to **Dashboard**\n3. Click **'Submit Capstone Metadata'**\n4. Fill in your project details\n5. Click **Submit**\n\nYour adviser will review and approve it. Once approved, it appears in the repository!",
    
    "how to upload": "**Uploading your project:**\n\n**Students:** Submit through Dashboard → your adviser approves it\n**Librarians:** Can upload directly without approval\n\nYou'll need: title, authors, abstract, keywords, and program info.",
    
    "how to submit my project": "**Submitting your capstone project:**\n\n1. Login to your student account\n2. Dashboard → 'Submit Capstone Metadata'\n3. Fill in all required fields\n4. Submit for validation\n\nYour adviser gets notified and will approve or give feedback!",
    
    // Save/Favorite Questions
    "how do i save": "**Saving projects:**\n\n1. Find a project you like\n2. Click the **bookmark icon** or 'Save' button\n3. View saved projects in your Dashboard\n\n**Note:** You must be logged in to save projects!",
    
    "how to save projects": "**To save favorites:**\n\n1. Login to your account\n2. Search for projects\n3. Click the bookmark icon on any project\n4. Access saved projects from your Dashboard\n\nGuests can't save - login required!",
    
    // Citation Questions
    "how do i cite": "**Generating citations:**\n\n1. Open any project details\n2. Click the **'Cite'** button\n3. Choose format: APA, MLA, or Chicago\n4. Click **'Copy'** to copy to clipboard\n\nPaste it into your document - done! ✅",
    
    "how to cite": "**Creating citations is easy:**\n\n1. View project details\n2. Click 'Cite' button\n3. Select citation style (APA/MLA/Chicago)\n4. Copy and paste into your work\n\nAvailable to everyone, even guests!",
    
    // Login Questions
    "how do i login": "**Logging in:**\n\n1. Click **'Login'** button (top right)\n2. Enter your email and password\n3. Click **'Sign In'**\n\n**Demo account:** student@ctu.edu.ph / CTU@Stud2024!\n\nDon't have an account? Click 'Sign Up'!",
    
    "cannot login": "**Login issues? Try these:**\n\n• Check your email and password\n• Make sure Caps Lock is off\n• Use 'Forgot Password' to reset\n• Try demo account: student@ctu.edu.ph\n\nStill stuck? Contact the library for help!",
    
    // Programs
    "what programs": "**Available programs:**\n\n• **BSIT** - Information Technology\n• **BSIE** - Industrial Engineering\n• **BSED** - Secondary Education\n• **BSAgriBusiness** - Agribusiness\n\nYou can filter search results by any of these programs!",
    
    "programs available": "**CTU Daanbantayan offers:**\n\n1. BSIT (Information Technology)\n2. BSIE (Industrial Engineering)\n3. BSED (Secondary Education)\n4. BSAgriBusiness (Agribusiness)\n\nEach program has capstone projects in the repository!",
    
    // Roles
    "what can i do": "**It depends on your role:**\n\n**Guest:** Search, view projects, use chatbot\n**Student:** Everything above + save projects, submit capstone\n**Adviser:** Everything above + approve student submissions\n**Librarian:** Everything above + upload directly\n**Admin:** Full access to everything\n\nLogin to unlock more features!",
    
    "what is my role": "**Check your role:**\n\nLook at the top right corner after logging in. You'll see your name and role badge.\n\n**Not logged in?** You're a Guest - limited features. Login for more!",
    
    // Chatbot
    "how does this work": "**RECAP is a digital library for capstone projects!**\n\nYou can:\n• **Search** thousands of projects\n• **View** abstracts and details\n• **Save** favorites (when logged in)\n• **Cite** projects in your research\n• **Submit** your own capstone\n\nI'm here to help you navigate everything!",
    
    "what can you do": "**I can help you with:**\n\n• Finding capstone projects\n• Learning how to search\n• Submitting your project\n• Generating citations\n• Understanding user roles\n• Troubleshooting issues\n\nJust ask me anything about RECAP!",
    
    // Conversations
    "how to save conversation": "**Saving conversations:**\n\n**Logged in:** Conversations auto-save! You can keep up to 3.\n**Guest:** Conversations are temporary and won't be saved.\n\n**Tip:** Login to save your chat history and access it anytime!",
    
    "conversation not saving": "**Conversations not saving?**\n\n• Make sure you're logged in (not guest)\n• Check if you have 3 conversations already (max limit)\n• Try logging out and back in\n\nGuests can't save conversations - login required!",
    
    // FAIR Principles
    "what is fair": "**FAIR Principles make research easy to find and use:**\n\n**F**indable - Easy to search and discover\n**A**ccessible - Open to everyone\n**I**nteroperable - Works with other systems\n**R**eusable - Can be cited and referenced\n\nRECAP follows FAIR to help your research reach more people!",
    
    // Topics
    "what topics": "**Popular research topics:**\n\n**Technology:** Machine Learning, IoT, Web Apps, Mobile Apps, AI\n**Education:** Teaching Methods, EdTech, Curriculum\n**Agriculture:** Smart Farming, Crop Management, IoT\n\nSearch any of these to find related projects!",
    
    // Help
    "help": "**I'm here to help! Ask me about:**\n\n• How to search for projects\n• How to submit your capstone\n• How to save favorites\n• How to generate citations\n• What programs are available\n• User roles and permissions\n\nWhat would you like to know?",
    
    "i need help": "**No problem! I can help with:**\n\n• Searching and finding projects\n• Submitting your capstone\n• Using system features\n• Troubleshooting issues\n\nWhat do you need help with specifically?",
    
    // Thank you
    "thank you": "You're welcome! 😊 Happy to help! If you have more questions, just ask!",
    "thanks": "No problem! 😊 Glad I could help! Feel free to ask anything else!",
    
    // About
    "what is recap": "**RECAP = Repository for Capstone Projects**\n\nIt's a digital library for CTU Daanbantayan Campus where you can:\n• Search thousands of capstone projects\n• View project details and abstracts\n• Save favorites and generate citations\n• Submit your own capstone\n\nThink of it as Google for CTU capstone projects!",
    
    "about recap": "**About RECAP:**\n\nRECAP is CTU Daanbantayan's online repository for capstone projects. It uses AI to help you find research, learn from past projects, and share your own work.\n\n**Features:** Smart search, chatbot help, citation generator, and more!",
    
    // Data queries (will be handled by AIDataContext)
    "longest title": null, // Handled by data context
    "shortest title": null, // Handled by data context
    "how many projects": null, // Handled by data context
    "statistics": null, // Handled by data context
    "most recent": null, // Handled by data context
    "latest project": null // Handled by data context
  },

  /**
   * Find direct answer for user question
   * @param {string} question - User's question
   * @returns {string|null} - Direct answer or null if not found
   */
  findDirectAnswer(question) {
    const normalized = question.toLowerCase().trim();
    
    // Check for exact matches first
    if (this.directAnswers[normalized]) {
      return this.directAnswers[normalized];
    }
    
    // Check for partial matches
    for (const [key, answer] of Object.entries(this.directAnswers)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return answer;
      }
    }
    
    return null;
  }
};

// Export for use in AI service
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIKnowledgeBase;
}
