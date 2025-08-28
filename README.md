# Simple Chat App

A basic one-to-one chat application using WebSockets, Node.js/Express backend, React frontend, and MySQL database.

## Features
- Real-time messaging using Socket.IO
- Simple name-based joining (no authentication)
- One-to-one private chats
- Message history stored in MySQL
- Basic React frontend with TypeScript

## Setup Instructions

### 1. Database Setup
1. Open MySQL Workbench
2. Connect to your local MySQL instance (localhost:3306)
3. Run the SQL script in `backend/database.sql` to create the database and tables

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
The server will run on http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
The React app will run on http://localhost:3000

### 4. Database Configuration
If your MySQL setup is different, update the database configuration in `backend/db.js`:
- host: default is 'localhost'
- user: default is 'root'
- password: default is empty (update if you have a password)
- port: default is 3306

## How to Use
1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Enter your name to join the chat
4. Select another user from the user list to start chatting
5. Type messages and press Enter or click Send

## Project Structure
```
chat-app/
├── backend/
│   ├── server.js       # Main Express server with Socket.IO
│   ├── db.js          # Database connection and operations
│   ├── database.sql   # Database schema
│   └── package.json
└── frontend/
    ├── src/
    │   ├── Chat.tsx    # Main chat component
    │   ├── App.tsx     # App component
    │   └── App.css     # Styles
    └── package.json
```

## Notes
- This is a learning project with minimal authentication
- Users are identified by name only
- Messages are stored permanently in the database
- Real-time communication via WebSockets
