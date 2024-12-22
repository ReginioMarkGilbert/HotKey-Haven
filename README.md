# HotKey Haven

A modern web application for managing and organizing hotkeys across different applications. Built with React, TypeScript, and MongoDB.

## Features

- Create and manage multiple hotkey sets for different applications
- Modern, responsive UI built with shadcn/ui components
- Real-time updates and feedback
- Clean and intuitive interface
- MongoDB backend for flexible data storage

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router DOM
- Axios

### Backend
- Node.js
- Express
- MongoDB
- TypeScript
- CORS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas connection)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hotkey-haven.git
cd hotkey-haven
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:
```bash
# In server directory, create .env file
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

4. Start the development servers:
```bash
# Start the backend server (from server directory)
npm run dev

# Start the frontend development server (from client directory)
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
hotkey-haven/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── types/        # TypeScript type definitions
│   └── ...
│
└── server/                # Backend Node.js application
    ├── src/
    │   ├── controllers/  # Route controllers
    │   ├── middleware/   # Express middleware
    │   ├── models/      # MongoDB models
    │   └── routes/      # API routes
    └── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.