# Use official SWI-Prolog image
FROM swipl:latest

# Install Node.js and npm
USER root
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy Prolog knowledge base
COPY diagnosis.pl ./

# Copy application code
COPY server.js ./
COPY public ./public

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]