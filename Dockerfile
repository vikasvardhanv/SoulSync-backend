# Use Node.js 20 Alpine for smaller image size and security
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Create non-root user first
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Copy Prisma schema
COPY --chown=nodejs:nodejs prisma ./prisma/

# Switch to node user for npm install
USER nodejs

# Install dependencies (use ci for production builds)
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --chown=nodejs:nodejs src ./src/

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