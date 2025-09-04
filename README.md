# Social Poll Network

A modern, Instagram-like social polling platform where users can create, share, and vote on polls with friends.

## 🚀 Features

### ✨ Core Features
- **User Authentication**: Secure registration and login system with JWT tokens
- **Profile Management**: Customizable user profiles with image upload
- **Poll Creation**: Rich poll creation with images, descriptions, and multiple options
- **Voting System**: Real-time voting with result visualization
- **Social Features**: Friend system, comments, and social interactions
- **Image Uploads**: Profile pictures and poll images with automatic processing

### 📱 Instagram-like Experience
- **Modern UI**: Clean, responsive design with smooth animations
- **Image Support**: Upload and share images with polls
- **Interactive Comments**: Threaded comments with replies and reactions
- **Real-time Updates**: Live poll results and notifications
- **Mobile Responsive**: Optimized for all device sizes

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **React Icons**: Beautiful icon library
- **React Toastify**: Toast notifications
- **Modern CSS**: Responsive design with CSS3 features

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload middleware
- **Sharp**: Image processing and optimization
- **bcryptjs**: Password hashing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Joshua-Walters/Social-Poll-Network.git
   cd Social-Poll-Network
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in the server directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/social-poll-platform
   # For production, use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/social-poll-platform
   
   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # File Upload Configuration (Optional)
   MAX_FILE_SIZE=5242880  # 5MB in bytes
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
   ```

5. **Database Setup**
   
   **Option A: Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service: `mongod`
   
   **Option B: MongoDB Atlas (Recommended for production)**
   - Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new cluster
   - Get connection string and update `MONGODB_URI` in `.env`

### 🚀 Running the Application

#### Development Mode

1. **Start the backend server**
   ```bash
   cd server
   npm run dev  # or npm start
   ```
   Server will start on http://localhost:5000

2. **Start the frontend client**
   ```bash
   cd client
   npm start
   ```
   Client will start on http://localhost:3000

#### Production Mode

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Start production server**
   ```bash
   cd server
   NODE_ENV=production npm start
   ```

## 🌐 Deployment

### Deployment to Heroku

1. **Install Heroku CLI**
2. **Login to Heroku**: `heroku login`
3. **Create Heroku app**: `heroku create your-app-name`
4. **Set environment variables**:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_atlas_connection_string
   heroku config:set JWT_SECRET=your_production_jwt_secret
   heroku config:set NODE_ENV=production
   ```
5. **Deploy**: `git push heroku main`

### Deployment to Vercel (Frontend) + Railway (Backend)

#### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/build`
4. Add environment variable: `REACT_APP_API_URL=your_backend_url`

#### Backend (Railway)
1. Connect GitHub repository to Railway
2. Set root directory: `server`
3. Add environment variables (MongoDB URI, JWT secret, etc.)

### Deployment to DigitalOcean App Platform

1. **Create App Platform app**
2. **Configure components**:
   - **Web Service**: 
     - Source: `server/`
     - Build command: `npm install`
     - Run command: `npm start`
   - **Static Site**:
     - Source: `client/`
     - Build command: `npm run build`
     - Output directory: `build`

## 📁 Project Structure

```
Social-Poll-Network/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # Reusable React components
│   │   │   ├── common/    # Common components
│   │   │   ├── layout/    # Layout components
│   │   │   ├── polls/     # Poll-related components
│   │   │   └── comments/  # Comment components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── styles/        # CSS files
│   ├── package.json
│   └── README.md
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── uploads/         # File upload directory
│   ├── .env             # Environment variables
│   ├── package.json
│   └── server.js        # Entry point
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/:id/friend-request` - Send friend request
- `POST /api/users/:id/accept-friend` - Accept friend request
- `GET /api/users/search` - Search users

### Polls
- `GET /api/polls` - Get polls (with pagination and filters)
- `POST /api/polls` - Create new poll
- `GET /api/polls/:id` - Get specific poll
- `POST /api/polls/:id/vote` - Vote on poll
- `DELETE /api/polls/:id` - Delete poll

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/poll/:pollId` - Get poll comments
- `DELETE /api/comments/:id` - Delete comment

### File Upload
- `POST /api/upload/profile-picture` - Upload profile picture
- `POST /api/upload/poll-image` - Upload poll image

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **File Upload Validation**: Type and size restrictions
- **Input Sanitization**: Protected against common attacks
- **CORS Configuration**: Secure cross-origin requests
- **Environment Variables**: Sensitive data protection

## 🎨 Customization

### Styling
- Modify CSS files in `client/src/components/` and `client/src/pages/`
- Update theme colors in `client/src/index.css`
- Customize component styles for your brand

### Features
- Add new poll types (multiple choice, ranking, etc.)
- Implement real-time features with Socket.io
- Add notification system
- Integrate third-party services (email, SMS, etc.)

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check Atlas connection string
   - Verify network access and IP whitelist in Atlas

2. **File Upload Issues**
   - Check file size limits and allowed types
   - Ensure uploads directory has write permissions

3. **CORS Errors**
   - Verify API URL in client environment variables
   - Check CORS configuration in server

4. **Build Failures**
   - Clear node_modules and reinstall dependencies
   - Check for conflicting package versions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@yourapp.com or create an issue in the GitHub repository.