# Use a light version of Node.js
FROM node:18-slim

# Create the app directory
WORKDIR /app

# Copy the package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy your bridge code (index.js)
COPY . .

# Start the bridge
CMD ["node", "index.js"]
