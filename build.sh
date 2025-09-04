#!/bin/bash

# Production Build Script for Social Poll Network
# This script builds the application for production deployment

echo "🚀 Starting production build for Social Poll Network..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📋 Environment Information:"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Build the React app
echo "🔨 Building React application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Client build failed!"
    exit 1
fi

cd ..

# Create production environment file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating production environment file..."
    cp server/.env.example server/.env
    echo "⚠️  Please update server/.env with your production configuration!"
fi

# Create uploads directory structure
echo "📁 Creating upload directories..."
mkdir -p server/uploads/profile-pics
mkdir -p server/uploads/poll-images

echo "✅ Production build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update server/.env with production database URI and JWT secret"
echo "2. Configure your web server to serve static files from client/build"
echo "3. Start the production server with: cd server && NODE_ENV=production npm start"
echo ""
echo "🌐 Deployment Options:"
echo "- Heroku: git push heroku main"
echo "- Vercel: vercel --prod"
echo "- Railway: railway up"
echo "- DigitalOcean App Platform: Connect your GitHub repository"
echo ""
echo "For detailed deployment instructions, see README.md"