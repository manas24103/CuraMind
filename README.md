# Doctor Dashboard Application

A modern web application for managing doctor appointments and patient records with AI-powered prescription suggestions.

## Features

- Doctor Dashboard with patient management
- Appointment scheduling system
- Patient medical history tracking
- AI-powered prescription suggestions
- Modern, responsive UI using Material-UI

## Tech Stack

- Frontend: React + Tailwind Css
- Backend: Node.js + Express + TypeScript
- Database: MongoDB
- AI Integration: OpenAI GPT-4 for prescription suggestions

## Setup Instructions

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/doctor-dashboard
OPENAI_API_KEY=your_openai_api_key
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Project Structure

```
doctor-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/      # Axios API calls
│   │   └── App.tsx
├── server/                 # Node.js + Express backend
│   ├── controllers/
│   ├── routes/
│   ├── models/            # Patient, Doctor, Appointment
│   ├── services/          # AI prescription logic
│   └── index.ts
├── database/              # MongoDB setup
└── README.md
```
