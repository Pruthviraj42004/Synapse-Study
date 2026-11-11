# 🎓 Study Sphere

<div align="center">

![Study Sphere Banner](https://img.shields.io/badge/StudySphere-Collaborative%20Learning%20Platform-blue?style=for-the-badge)

**A powerful real-time collaborative learning platform with AI-powered features**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?logo=socket.io)](https://socket.io/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### 🤖 AI-Powered Assistant
- **Intelligent Chatbot** powered by Groq's Llama 3.3 70B model
- Generate programming quizzes on any topic
- Create personalized learning roadmaps
- Code analysis and debugging assistance
- Real-time Q&A for programming concepts

### 👥 Collaborative Study Rooms
- Create public or private study rooms
- Real-time participant management
- Integrated chat messaging
- Study session statistics and analytics
- College-specific room filtering

### 💻 Live Code Collaboration
- **Real-time Collaborative Editing**: Multiple users can edit code simultaneously
- **CRDT-based Sync**: Conflict-free editing with Yjs (Conflict-free Replicated Data Types)
- **Live Cursor Tracking**: See where teammates are editing in real-time
- **User Presence**: Visual indicators showing active collaborators with colored avatars
- **Multi-language Support**: JavaScript, TypeScript, Python, Java, C#, C++, C, Go, Rust, PHP, Ruby, HTML, CSS, SQL
- **Monaco Editor**: Full VS Code editor experience with IntelliSense and syntax highlighting
- **Secure Docker Execution**: Isolated code execution in Docker containers
- **Code Session Management**: Save and restore collaborative sessions
- **File Upload Support**: Share code files and custom inputs

### 🎨 Interactive Whiteboard
- Real-time collaborative drawing with Fabric.js
- Multiple drawing tools (pen, shapes, text, eraser)
- Color picker and stroke customization
- Canvas save/load functionality
- Perfect for visual explanations and brainstorming

### 📹 Video Conferencing
- Integrated Jitsi Meet video calls
- Screen sharing capabilities
- Audio/video toggle controls
- Seamless integration within study rooms

### 📊 User Statistics & Analytics
- Track total study time
- Monitor active study sessions
- View study room participation history
- Analyze learning progress over time

### 🎯 Programming Challenges
- Create and share coding challenges
- Multiple difficulty levels
- Test case validation
- Challenge leaderboards
- Progress tracking

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| ![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react) | UI Framework |
| ![Material-UI](https://img.shields.io/badge/Material--UI-5.14-007FFF?logo=mui) | Component Library |
| ![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-1.9-764ABC?logo=redux) | State Management |
| ![Socket.io Client](https://img.shields.io/badge/Socket.io%20Client-4.7-010101?logo=socket.io) | Real-time Communication |
| ![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-4.7-0066B8?logo=visualstudiocode) | Code Editor |
| ![Yjs](https://img.shields.io/badge/Yjs-13.6-FF6B6B) | CRDT for Collaboration |
| ![Fabric.js](https://img.shields.io/badge/Fabric.js-5.3-FF6347) | Canvas/Whiteboard |
| ![React Jitsi](https://img.shields.io/badge/React%20Jitsi-1.0-97979A) | Video Conferencing |
| ![Axios](https://img.shields.io/badge/Axios-1.4-5A29E4) | HTTP Client |

### Backend
| Technology | Purpose |
|-----------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-Latest-43853D?logo=node.js) | Runtime Environment |
| ![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express) | Web Framework |
| ![MongoDB](https://img.shields.io/badge/MongoDB-7.4-47A248?logo=mongodb) | Database |
| ![Mongoose](https://img.shields.io/badge/Mongoose-7.4-880000) | ODM |
| ![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?logo=socket.io) | WebSocket Server |
| ![JWT](https://img.shields.io/badge/JWT-9.0-000000?logo=jsonwebtokens) | Authentication |
| ![Dockerode](https://img.shields.io/badge/Dockerode-4.0-2496ED?logo=docker) | Container Management |
| ![Groq API](https://img.shields.io/badge/Groq%20API-Llama%203.3-FF6B35) | AI/LLM Integration |

### Code Execution & Security
| Technology | Purpose |
|-----------|---------|
| ![Docker](https://img.shields.io/badge/Docker-Latest-2496ED?logo=docker) | Isolated Code Execution |
| ![Helmet](https://img.shields.io/badge/Helmet-7.0-000000) | Security Headers |
| ![Express Rate Limit](https://img.shields.io/badge/Rate%20Limit-6.8-FF6B6B) | API Rate Limiting |
| ![bcryptjs](https://img.shields.io/badge/bcryptjs-2.4-4A90E2) | Password Hashing |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Docker (for code execution feature)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/prithamnandavaram/majorproject.git
cd majorproject/majorproject2
```

### 2️⃣ Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

### 3️⃣ Environment Configuration

Create `.env` file in the `server` directory:

```env
# Server
NODE_ENV=development
PORT=5002

# Database
MONGODB_URI=mongodb://localhost:27017/studySphere

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:3000

# Groq API (Free AI - Get key from https://console.groq.com)
HUGGINGFACE_API_KEY=gsk_YOUR_GROQ_API_KEY_HERE
HF_ENDPOINT_URL=https://api.groq.com/openai
HF_ENDPOINT_STYLE=openai
HF_CHAT_MODEL=llama-3.3-70b-versatile

# Socket.IO
SOCKET_ORIGIN=http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:5000

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4️⃣ Start MongoDB
```bash
# Using MongoDB locally
mongod

# Or use MongoDB Atlas connection string in .env
```

### 5️⃣ Start Docker (for code execution)
```bash
# Ensure Docker daemon is running
docker info
```

### 6️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

> Note: The Socket.IO server runs on the same port as the Express backend. If you customize ports, set `REACT_APP_SOCKET_URL` accordingly.

---

## 🔧 Whiteboard Sync Fixes (Nov 2025)

Recent improvements to stabilize real-time whiteboard collaboration:

- Aligned Socket.IO client fallback to `http://localhost:5000`.
- Reliable room join with acknowledgements and retry on the client.
- Sticky room membership: automatic re-join on reconnect.
- Server self-heal: auto-join socket to room if an update arrives before join completes.
- Idempotent socket initialization to avoid duplicate connections and ghost cursors.

If you open the whiteboard in two tabs, refresh one, and draw in either tab, updates should now sync immediately in both.

---

## 📖 Usage

### Getting Started

1. **Sign Up / Login**
   - Create a new account or login with existing credentials
   - JWT-based authentication ensures secure access

2. **Create or Join Study Rooms**
   - Create public/private study rooms
   - Filter by college or interest
   - Invite friends via room links

3. **Collaborate in Real-Time**
   - Write code together with live cursor tracking
   - Draw on the shared whiteboard
   - Video call with integrated Jitsi Meet
   - Chat with participants

4. **Use AI Assistant**
   - Click the floating chatbot icon
   - Ask programming questions
   - Generate quizzes for practice
   - Create learning roadmaps
   - Get code analysis and debugging help

5. **Execute Code**
   - Select your programming language
   - Write or paste code in Monaco editor
   - Click "Run" to execute in isolated Docker container
   - View output in real-time

6. **Track Progress**
   - View your study statistics
   - Monitor time spent in sessions
   - Analyze learning patterns

---

## 🔌 API Documentation

### Authentication
```http
POST /api/auth/register      # Register new user
POST /api/auth/login         # Login user
GET  /api/auth/me            # Get current user
PUT  /api/auth/update        # Update user profile
```

### Study Rooms
```http
GET    /api/study-rooms           # Get all study rooms
POST   /api/study-rooms           # Create study room
GET    /api/study-rooms/:id       # Get specific room
PUT    /api/study-rooms/:id       # Update room
DELETE /api/study-rooms/:id       # Delete room
POST   /api/study-rooms/:id/join  # Join room
```

### Programming
```http
POST /api/programming/execute                # Execute code
GET  /api/programming/sessions               # Get code sessions
POST /api/programming/sessions               # Create session
GET  /api/programming/challenges             # Get challenges
POST /api/programming/challenges             # Create challenge
```

### AI Chat
```http
POST /api/chat/chat                # Chat with AI
POST /api/chat/analyze-code        # Analyze code
POST /api/chat/generate-quiz       # Generate quiz
POST /api/chat/generate-roadmap    # Generate roadmap
POST /api/chat/answer-question     # Answer specific question
```

### Whiteboard
```http
GET  /api/whiteboard/:roomId       # Get whiteboard state
POST /api/whiteboard/:roomId       # Save whiteboard state
```

### User Statistics
```http
GET /api/user/statistics           # Get user statistics
```

---

## 🎨 Key Features Deep Dive

### Real-Time Code Collaboration
- **CRDT-based synchronization** using Yjs ensures conflict-free editing with automatic conflict resolution
- **Live cursor tracking** shows where teammates are editing with colored indicators and user names
- **Presence awareness** displays active collaborators with avatars in the editor toolbar
- **Operational Transformation** alternative: Yjs provides superior performance over OT-based systems
- **Room-based sessions** allow multiple isolated collaborative editing sessions
- **Syntax highlighting** for 13 programming languages with full Monaco Editor features
- **Secure execution** in isolated Docker containers prevents malicious code from affecting the system
- **Session persistence** stores collaborative state on the server for reconnection support

### AI-Powered Learning
- **Groq's Llama 3.3 70B** model provides intelligent responses
- **Context-aware** chat understands your code and questions
- **Multi-functional**: quizzes, roadmaps, code analysis, Q&A
- **Rule-based fallback** ensures chatbot always responds

### Study Room Management
- **Flexible privacy**: public rooms for discovery, private for focused groups
- **College filtering**: find study groups from your institution
- **Real-time presence**: see who's active in each room
- **Persistent chat history**: never lose important discussions

---

## 🧪 Supported Programming Languages

| Language | Version | Execution Time Limit | Collaborative Support |
|----------|---------|---------------------|----------------------|
| JavaScript | Node 18 | 10 seconds | ✅ Real-time |
| TypeScript | Node 18 + TS | 10 seconds | ✅ Real-time |
| Python | 3.11 | 10 seconds | ✅ Real-time |
| Java | 17 | 15 seconds | ✅ Real-time |
| C# | .NET 7 | 15 seconds | ✅ Real-time |
| C++ | GCC 11 | 10 seconds | ✅ Real-time |
| C | GCC 11 | 10 seconds | ✅ Real-time |
| Go | 1.21 | 10 seconds | ✅ Real-time |
| Rust | 1.70 | 15 seconds | ✅ Real-time |
| Ruby | 3.2 | 10 seconds | ✅ Real-time |
| PHP | 8.2 | 10 seconds | ✅ Real-time |
| HTML | - | - | ✅ Real-time |
| CSS | - | - | ✅ Real-time |
| SQL | - | - | ✅ Real-time |

---

## 🔒 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Password hashing** with bcrypt (10 rounds)
- **Rate limiting** on all API endpoints
- **Helmet.js** for security headers
- **MongoDB sanitization** against NoSQL injection
- **Docker isolation** for code execution
- **CORS** protection
- **HPP** (HTTP Parameter Pollution) protection
- **Express Validator** for input validation

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

**StudySphere Team**
- GitHub: [@prithamnandavaram](https://github.com/prithamnandavaram)

---

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for providing free, fast AI inference
- [MongoDB](https://www.mongodb.com/) for the database platform
- [Jitsi](https://jitsi.org/) for video conferencing infrastructure
- [Docker](https://www.docker.com/) for container technology
- [Socket.io](https://socket.io/) for real-time communication
- All open-source contributors whose libraries made this possible

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/prithamnandavaram/majorproject/issues)
- **Discussions**: [GitHub Discussions](https://github.com/prithamnandavaram/majorproject/discussions)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by the StudySphere Team

</div>
