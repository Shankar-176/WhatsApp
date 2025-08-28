# WhatsApp Lite

A real-time chat application built with React and Node.js, featuring Socket.IO for real-time messaging.

## Project Structure

```
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store and slices
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/           # Node.js backend server
│   ├── src/
│   │   ├── config/        # Database and app configuration
│   │   ├── middleware/    # Express middleware
│   │   ├── modules/       # Feature modules (auth, users, messages)
│   │   ├── sockets/       # Socket.IO handlers
│   │   └── utils/         # Utility functions
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Installation

1. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=whatsapp_lite
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   CLIENT_URL=http://localhost:3000
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

## Features

- Real-time messaging with Socket.IO
- User authentication (register, login, forgot password)
- Image sharing
- Online/offline status
- Typing indicators
- Message status (sent, delivered, seen)
- Responsive design with Bootstrap

## Technologies Used

### Frontend
- React 18
- Redux Toolkit
- React Router
- Bootstrap 5
- Socket.IO Client
- Axios

### Backend
- Node.js
- Express.js
- Socket.IO
- MySQL
- JWT Authentication
- Bcrypt
- Winston (Logging)
- Joi (Validation)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Messages
- `GET /api/messages` - Get chat messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

## Socket Events

### Client to Server
- `join_chat` - Join a chat room
- `send_message` - Send a message
- `typing` - Typing indicator
- `mark_seen` - Mark messages as seen

### Server to Client
- `message_received` - New message received
- `typing_status` - User typing status
- `user_online` - User came online
- `user_offline` - User went offline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.