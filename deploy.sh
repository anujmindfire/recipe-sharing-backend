#!/bin/bash

# Set environment variables
export NODE_ENV=production

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Start the application
echo "Starting the application..."
npm start

echo "Deployment completed successfully!"
