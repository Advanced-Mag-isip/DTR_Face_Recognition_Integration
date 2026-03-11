# Attendance Tracker

A full-stack attendance tracking application built with React, Vite, TailwindCSS, and Node.js/Express backend.

## Features

- User authentication (JWT-based)
- Attendance management
- Responsive UI with TailwindCSS and DaisyUI
- RESTful API backend

## Tech Stack

### Frontend
- React 19
- Vite
- TailwindCSS 4
- DaisyUI
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MySQL2 with Sequelize ORM
- JWT authentication
- bcryptjs for password hashing

## Project Structure

```
attendance-tracker/
├── src/              # Frontend React source code
├── backend/          # Backend Node.js/Express server
│   ├── models/       # Sequelize models
│   ├── middleware/   # Express middleware
│   ├── server.js     # Express server entry point
│   └── seed.js       # Database seeding script
├── public/           # Static assets
└── dist/             # Production build output
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd attendance-tracker
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Configure environment variables:
Create a `.env` file in the `backend` folder with your database credentials.

5. Seed the database (optional):
```bash
cd backend
node seed.js
```

### Running the Application

**Frontend (development):**
```bash
npm run dev
```

**Backend:**
```bash
cd backend
npm start
```

### Building for Production

```bash
npm run build
```

## License

ISC
