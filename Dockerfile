# Build stage
FROM node:18-alpine AS builder

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock* ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
    else echo "No lockfile found." && exit 1; fi

# Copy source code
COPY . .

# Build the application
ENV NODE_ENV=production

RUN npm run build

# Production stage
FROM nginx:alpine AS runner

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user for nginx
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
