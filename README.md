# Real Time Chatting App

<p align="center">
  <strong>Real Time Chatting App</strong> is a full-stack messaging platform for instant conversations, friend management, and live updates.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

## Overview

This application is built to provide a smooth real-time chat experience with secure authentication, socket-driven messaging, and a modern React interface. It includes user profiles, friend requests, notifications, media uploads, and conversation tracking in a structured full-stack architecture.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [How to Contribute](#how-to-contribute)
- [License](#license)
- [Author](#author)

## Features

- Real-time chat with Socket.IO on both client and server
- Secure authentication using JWT and bcrypt
- Friend request workflow and relationship management
- Notification handling for live user activity
- Conversation and message persistence with MongoDB
- Profile image upload support through Cloudinary and Multer
- Responsive UI built with React and Tailwind CSS
- Clean route, controller, model, and socket separation on the backend

## Tech Stack

### Frontend

- ⚛️ React 19
- 🎨 React DOM 19
- ⚡ Vite
- 🔧 @vitejs/plugin-react
- 🎨 Tailwind CSS v4
- 🧩 @tailwindcss/vite
- 🧭 React Router DOM 7
- 🔌 Socket.IO Client
- 🧩 React Icons
- 🧹 ESLint
- 🧪 @types/react
- 🧪 @types/react-dom
- 🌐 globals

### Backend

- 🟢 Node.js
- 🚂 Express 5
- 🍃 MongoDB
- 🧱 Mongoose
- 🔐 JSON Web Token (JWT)
- 🔒 bcrypt
- 📡 Socket.IO
- ☁️ Cloudinary
- 📤 Multer
- 🍪 cookie-parser
- 🌍 CORS
- 🧪 dotenv

### Development Tools

- 🛠️ Nodemon
- 🧹 ESLint

## Project Structure

```bash
Real_TIme_Chatting app/
├── Backend/
│   ├── package.json
│   ├── public/
│   │   └── temp/
│   └── src/
│       ├── app.js
│       ├── constants.js
│       ├── index.js
│       ├── controllers/
│       ├── db/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── socket/
│       └── utils/
└── Client/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── App.css
        ├── main.jsx
        ├── api/
        ├── assets/
        ├── components/
        ├── context/
        ├── pages/
        ├── socket/
        └── utils/
```

### Backend Responsibilities

- `controllers/` contains request handlers for conversations, messages, users, notifications, and friend requests.
- `models/` defines the MongoDB schemas used by the app.
- `routes/` maps HTTP endpoints to controllers.
- `middlewares/` handles auth and file upload logic.
- `socket/` keeps the real-time socket flow isolated from the REST API.
- `utils/` holds reusable helpers, response wrappers, error classes, and Cloudinary setup.

### Client Responsibilities

- `pages/` contains the main application screens.
- `components/` stores reusable UI blocks like chat containers and sidebars.
- `context/` manages authentication state and shared client data.
- `api/` contains the HTTP request helpers for the frontend.
- `socket/` manages the client-side socket connection.
- `utils/` keeps small helper functions for chat behavior.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB database
- Cloudinary account for image uploads

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd "Real_TIme_Chatting app"
```

### 2. Install dependencies

Backend:

```bash
cd Backend
npm install
```

Frontend:

```bash
cd ../Client
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `Backend` folder and add the required values.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 4. Run the application

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend in a separate terminal:

```bash
cd Client
npm run dev
```

## Available Scripts

### Backend

- `npm run dev` - Start the backend with Nodemon and dotenv preloaded

### Client

- `npm run dev` - Start the Vite development server
- `npm run build` - Build the frontend for production
- `npm run lint` - Run ESLint across the client source
- `npm run preview` - Preview the production build locally

## How to Contribute

Contributions are welcome.

1. Fork the repository.
2. Create a branch for your change.
3. Implement your fix or feature.
4. Test locally before opening a pull request.
5. Submit a PR with a clear summary of what changed.

### Contribution Guidelines

- Keep pull requests focused and easy to review.
- Follow the existing naming and folder structure.
- Write clean, readable code.
- Update docs if you add or change behavior.
- Avoid introducing unnecessary dependencies.

## License

This project is licensed under the ISC license.

## Author

Achintya Singh