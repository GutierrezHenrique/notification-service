FROM node:20-alpine3.18

# Install OpenSSL 1.1 compat and pnpm
RUN apk add --no-cache openssl1.1-compat && \
    npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma:generate

# Build the application
RUN pnpm build

EXPOSE 3001

# Start the application
CMD ["pnpm", "start:prod"]
