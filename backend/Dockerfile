# Dockerfile for Node.js + Python (for Railway)
FROM node:18-bullseye

# Install Python3 and pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Set python alias for compatibility
RUN ln -s /usr/bin/python3 /usr/bin/python

# Set workdir
WORKDIR /app

# Copy backend files
COPY . /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r rekomendasi_api/requirements.txt

# Install Node.js dependencies
RUN npm install

# Expose port (default Railway uses $PORT env)
EXPOSE 5000

# Start Node.js app
CMD ["npm", "start"]
