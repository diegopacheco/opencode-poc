#!/bin/bash

echo "🏗️  Building Coaching Application..."
echo "===================================="

echo "📁 Building Backend..."
cd backend
./build.sh
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
cd ..

echo "📁 Building Frontend..."
cd frontend
echo "Installing dependencies..."
bun install
echo "Building frontend..."
bun run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
cd ..

echo "===================================="
echo "✅ All builds completed successfully!"
echo "🚀 You can now run: ./start.sh"
echo "===================================="