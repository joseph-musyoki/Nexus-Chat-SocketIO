
# Nexus Chat

A distributed real-time messaging application built with React, Node.js, Express, Socket.IO, and MongoDB. Nexus Chat is designed to support real-time communication across multiple server nodes, with shared message storage and cross-node message synchronization.

## Live Application

- **Frontend:** https://nexus-chat-socket-io.vercel.app
- **Backend API:** https://nexus-chat-api-91aa.onrender.com

## Project Overview

Nexus Chat is a web-based messaging system that allows users to create accounts, authenticate securely, view other registered users, and exchange private messages in real time.

The system uses a distributed backend architecture where multiple Node.js server instances can share data through a common MongoDB database. MongoDB Change Streams are used to detect new messages and synchronize them across connected server nodes.

## Key Features

- User registration and authentication.
- Secure password hashing using bcrypt.
- JWT-based authentication.
- Real-time messaging using Socket.IO.
- Private one-to-one conversations.
- Message history stored in MongoDB.
- User and contact management.
- Shared database architecture for multiple server nodes.
- Cross-node message synchronization using MongoDB Change Streams.
- Responsive React frontend.

## Technology Stack

### Frontend
- React
- Vite
- React Router DOM
- Axios
- Socket.IO Client
- Lucide React
- CSS

### Backend
- Node.js
- Express.js
- Socket.IO
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs
- CORS

### Deployment
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Version Control:** Git and GitHub

## System Architecture

```text
             CLIENT APPLICATIONS
              (React + Vite)
                     |
                     |
                Socket.IO
                     |
          -----------------------
          |                     |
       NODE A                 NODE B
     (Port 3001)            (Port 3002)
          |                     |
          |                     |
          -----------+-----------
                     |
               MongoDB Atlas
                     |
              Message Collection
                     |
              MongoDB Change
                  Streams
                     |
          Cross-Node Synchronization
```

Both server nodes are designed to connect to the same MongoDB database. When a new message is stored, MongoDB Change Streams allow connected nodes to detect the database change and broadcast the message to their relevant connected clients.

## Project Structure

```text
Nexus-Chat/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── groupController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── Group.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── sockets/
│   │   └── socket.js
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   └── index.html
│
└── README.md
```

## Getting Started

### Prerequisites

Install the following:

- Node.js and npm.
- MongoDB Atlas account or a compatible MongoDB replica-set deployment.
- Git.
- A code editor such as Visual Studio Code.

### 1. Clone the Repository

```bash
git clone https://github.com/joseph-musyoki/Nexus-Chat-SocketIO.git

cd Nexus-Chat-SocketIO
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=3001
NODE_ENV=development
NODE_NAME=node-a
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_secure_jwt_secret
```

Replace the placeholder values with your own configuration.

### 3. Start the Backend

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:3001
```

### 4. Configure the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

### 5. Start the Frontend

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Retrieve other registered users |

### Messages

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages/private/:userId` | Retrieve private conversation history |
| GET | `/api/messages/group/:groupId` | Retrieve group conversation history |

### Groups

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/groups` | Create a group |
| GET | `/api/groups` | Retrieve available groups |

Protected endpoints require a valid JWT access token in the Authorization header:

```text
Authorization: Bearer YOUR_TOKEN
```

## Real-Time Communication

Nexus Chat uses Socket.IO for real-time communication between clients and backend servers.

### Main Socket Events

| Event | Description |
|---|---|
| `connection` | Establishes a client connection |
| `send_message` | Sends a message to the backend |
| `new_message` | Delivers a new message to relevant clients |

Messages are stored in MongoDB. MongoDB Change Streams monitor message insertions and allow server nodes to synchronize newly created messages with their connected clients.

## Distributed Architecture

The system is designed around two backend server nodes:

| Server | Port | Node Name |
|---|---:|---|
| Node A | 3001 | node-a |
| Node B | 3002 | node-b |

Both nodes connect to the same MongoDB database.

This architecture is intended to demonstrate:

- Distributed client connections.
- Shared persistent message storage.
- Cross-node message synchronization.
- Concurrent client communication.
- Improved availability through multiple server instances.

## Testing

The following scenarios can be used to test the application:

1. Register two different user accounts.
2. Log in using both accounts.
3. Open the application in separate browser sessions.
4. Send a private message between the accounts.
5. Confirm that messages appear in real time.
6. Refresh the application and verify message history.
7. Connect clients to different server nodes and test cross-node communication.

## Environment Variables and Security

- Never commit `.env` files.
- Store database credentials in environment variables.
- Use strong JWT secrets.
- Passwords are hashed before being stored.
- Protected API routes require authentication.
- Private messages should only be delivered to their intended recipients.

## Future Improvements

- Complete deployment of the second backend node.
- Client reconnection and server failover.
- Shared online/offline presence tracking.
- Group messaging enhancements.
- Automated backend and frontend tests.
- Improved message delivery and error handling.
- File and media sharing.

## Author

**Joseph Musyoki**

Software Engineering Student  
Kirinyaga University

GitHub: https://github.com/joseph-musyoki

Portfolio: https://portfolio-1dvd.vercel.app/

## License

This project was developed for academic and educational purposes.
