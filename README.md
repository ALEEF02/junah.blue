# Junah Site

## Project Structure

```
junah.blue/
├── client/          # React frontend application
├── backend/         # Express.js backend API
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js
- npm
- Docker and Docker Compose
- MongoDB (if running locally without Docker)

## Setup

### Docker Setup

This will run the entire stack in docker:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd junah.blue
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - MongoDB: mongodb://localhost:27017

4. **Stop the application**
   ```bash
   docker-compose down
   ```

### Local Development Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB** (if not using Docker)
   - Install MongoDB locally or use MongoDB Atlas
   - Update connection string in `backend/dbConfig/settings.js`

4. **Start the backend server**
   ```bash
   npm run dev
   ```

   Server will start on http://localhost:3001

#### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   Application will open on http://localhost:3000