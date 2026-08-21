# CreateForge AI..

AI-powered creative workspace platform for modern content creators, designers, and developers.

[![Full-Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Express%20%7C%20MongoDB-blue.svg)](#technology-stack)
[![Image AI](https://img.shields.io/badge/Image%20Engine-FLUX%20Image%20Generation-indigo.svg)](#features)
[![Text AI](https://img.shields.io/badge/Text%20Engine-Google%20Gemini%20%7C%20Groq-violet.svg)](#features)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CreateForge AI** delivers four specialized, distraction-free creative tools within a single unified workspace:

- ✍️ **Article Generation**: Crafts structured, rich Markdown articles with customizable tones, target audiences, and length presets.
- 💡 **Blog Title Generation**: Generates high-impact, categorized headline ideas for blogs and social content.
- 🎨 **AI Image Generation**: Synthesizes high-fidelity visuals powered by the **FLUX** model across 10 aesthetic styles and 6 standardized aspect ratios.
- ✂️ **Background Removal**: Extracts transparent cutouts for product shots and creative assets.
- 📜 **Creative History**: Centralized user generation log with instant search, filtering, copying, and download capabilities.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router
- **Backend**: Node.js, Express, MongoDB / Mongoose, JWT Authentication, Cookie-Parser, Multer
- **AI Engine**: FLUX Image Generation, Google Gemini API, Groq AI API
- **Cloud Storage**: Optional Cloudinary integration

---

## 🏛️ AI Provider Architecture

To maintain maximum security, all AI provider API calls happen strictly on the server backend. Private API keys are never exposed to the client application:

```
Client (React + Vite)
        │
        ▼ HTTP REST / JWT
CreateForge Backend (Node.js + Express)
        │
        ├──► Pollinations / FLUX (Image Generation)
        ├──► Google Gemini API (Text & JSON Synthesis)
        └──► Groq API (Fast LLM Fallback)
        │
        ▼
Response Returned to Client
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB instance (local or MongoDB Atlas connection)
- npm or yarn

### 1. Installation

Install all project dependencies for both client and server:

```bash
# Install server and client dependencies from root
npm run install:all
```

Alternatively, install them individually:

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

---

## ⚙️ Environment Setup

### Server Configuration

Create the server environment configuration file:

```bash
# Copy template in server directory
cp server/.env.example server/.env
```

Edit `server/.env` with your own credentials:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGODB_URI=mongodb://localhost:27017/createforge_ai

# JWT Authentication
JWT_SECRET=your_long_random_jwt_secret_here
JWT_EXPIRES_IN=7d

# AI API Providers (Server-side only)
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
POLLINATIONS_API_KEY=your_pollinations_api_key_here
FLUX_API_KEY=your_flux_api_key_here

# Optional Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

> **IMPORTANT**: Never commit `.env` files to Git. All private API keys and database credentials must remain local.

### Client Configuration

Create the client environment configuration file:

```bash
# Copy template in client directory
cp client/.env.example client/.env
```

Edit `client/.env`:

```env
# API Backend URL
VITE_API_URL=http://localhost:5000/api
```

> **NOTE**: Vite environment variables starting with `VITE_` are bundled with client assets. Never put private AI provider keys into `client/.env`.

---

## 💻 Local Development

Run the development servers:

```bash
# Run both backend and frontend from root scripts:
npm run dev:server    # Starts backend server on http://localhost:5000
npm run dev:client    # Starts frontend app on http://localhost:5173
```

Or run directly from their respective directories:

```bash
# Backend (server directory)
cd server
npm run dev

# Frontend (client directory)
cd client
npm run dev
```

---

## 🧪 Testing & Validation

Run the backend automated test suite:

```bash
# Run server test suite from root
npm run test:server

# Or inside server directory
cd server
npm test
```

Build the client production bundle:

```bash
# Build client
npm run build:client
```

---

## 🔒 Security & Best Practices

- **Zero Secret Exposure**: `.gitignore` strictly excludes all `.env`, secret keys, credentials, certificates, logs, and build artifacts.
- **Backend API Gateway**: All AI requests route through the backend, keeping third-party keys hidden.
- **HTTP-Only Cookies & Bearer Tokens**: Dual session handling ensuring secure web authentication.
- **Input Sanitization & Normalization**: User inputs are sanitized and normalized before processing.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
