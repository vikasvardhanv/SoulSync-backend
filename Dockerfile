# Use Node.js 20 Alpine for smaller image size and security
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Ensure /app is writable by built-in non-root user 'node' and create node_modules ahead of time
RUN mkdir -p /app/node_modules && chown -R node:node /app

# Copy package files
COPY --chown=node:node package*.json ./

# Copy Prisma schema
COPY --chown=node:node prisma ./prisma/

# Switch to node user for npm install
USER node

# Install dependencies (use ci for production builds)
# Use --omit=dev instead of deprecated --only=production
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code
COPY --chown=node:node src ./src/

# Generate Prisma client
RUN npm run prisma:generate

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "import('http').then(http => { \
    http.get('http://localhost:5001/health', res => { \
      process.exit(res.statusCode === 200 ? 0 : 1); \
    }).on('error', () => process.exit(1)); \
  })"

# Set environment to production
ENV NODE_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"] 