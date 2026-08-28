# CreateForge AI — AI Creative Production Studio

CreateForge AI is an enterprise-grade AI Creative Production Studio that transforms a single creative concept into a complete omnichannel launch pipeline across writing, visual generation, research, SEO, social packs, and quality intelligence.

[![Full-Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20MongoDB-blue.svg)](#technology-stack)
[![Image AI](https://img.shields.io/badge/Image%20Engine-FLUX%20Image%20Generation-indigo.svg)](#features)
[![Text AI](https://img.shields.io/badge/Text%20Engine-Google%20Gemini%20%7C%20Groq-violet.svg)](#features)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 The Connected Omnichannel Creative Pipeline

CreateForge AI operates as ONE connected studio where every stage shares the global project context:

```
IDEA ──► CREATIVE BRIEF ──► RESEARCH ──► STRATEGY ──► ARTICLE ──► FLUX VISUALS ──► SEO ──► SOCIAL ──► QUALITY ──► EXPORT ──► LAUNCH
```

1. **Autonomous Campaign Builder**: Synthesizes 8-stage omnichannel launch blueprints from a single prompt.
2. **Creative Brief Studio**: Analyzes audience psychographics, core messaging, value propositions, and deliverables.
3. **Research Studio**: Generates search intent matrices, content gap analysis, market insights, and competitive angles.
4. **Blog Titles & Headline Lab**: Categorized headline generation with CTR scores, curiosity hooks, and head-to-head title comparison.
5. **Article Generator & Inline AI Editor**: Long-form article drafting with real-time critic scoring, readability audits, and version control.
6. **FLUX Image Generator**: High-fidelity visual creation powered by Pollinations with multi-style expansions and aspect ratios.
7. **Social Content Pack**: Multi-channel copywriting for LinkedIn, X/Twitter, Instagram, YouTube, and Threads.
8. **SEO Studio**: Search intent mapping, meta titles, descriptions, keyword matrices, and SERP previews.
9. **Quality Center**: Unified CreateForge Quality Score (0-100) assessing content quality, brand consistency, and SEO.
10. **10-Point Launch Readiness**: Real-time project asset verification ensuring campaigns are launch-ready.

---

## 🏛️ AI Provider & Orchestrator 2.0 Architecture

CreateForge AI routes tasks intelligently between specialized providers:

- **Google Gemini**: Complex multi-stage reasoning, long-form articles, research synthesis, briefs, brand intelligence, and SEO.
- **Groq**: High-speed short generation, blog titles, hooks, social snippets, inline text transforms, and fast copilot interactions.
- **Pollinations (FLUX)**: Photorealistic visual synthesis, aspect ratio mappings (1:1, 16:9, 9:16, 4:3, 3:4, 3:2), and variations.

```
                  USER REQUEST
                       │
                       ▼
             [TASK CLASSIFICATION]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[Google Gemini (Complex)]   [Groq (High-Speed)]
         │                           │
         └─────────────┬─────────────┘
                       ▼
      [STRUCTURED OUTPUT SERVICE 2.0]
    (Markdown Stripping • JSON Repair • Schema Validation)
                       │
                       ▼
          [MONGODB ATLAS PERSISTENCE]
                       │
                       ▼
        [FRONTEND WORKSPACE RESPONSE]
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router, Canvas Drag-and-Drop
- **Backend**: Node.js, Express, MongoDB / Mongoose, JWT Authentication, Cookie-Parser, Multer
- **AI Engines**: Google Gemini API, Groq AI API, Pollinations FLUX Engine
- **Storage**: MongoDB Atlas, optional Cloudinary integration

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB instance (Local or MongoDB Atlas)
- npm or yarn

### 1. Installation

```bash
# Install dependencies for server and client
npm run install:all
```

### 2. Environment Variables

Create `server/.env` based on `server/.env.example`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_secure_jwt_secret_key

# AI Provider API Keys (Stored backend-only)
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
POLLINATIONS_API_KEY=your_pollinations_key
```

### 3. Development Server

```bash
# Run backend and frontend concurrently
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 🔒 Security & Data Isolation

- **Zero Client-Side Secrets**: All AI API keys and database credentials reside exclusively on the Express backend.
- **Strict User & Project Isolation**: Every query and database operation is scoped by `userId` and `projectId`.
- **Protected Endpoints**: All AI creation routes require valid JWT authentication and are protected by rate limiters.

---

## 🧪 Testing & Build Verification

```bash
# Run backend smoke tests & test suites
npm run test:server

# Build frontend production bundle
npm run build:client
```
