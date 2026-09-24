# ---- Build stage: validate & assemble static assets ----
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy application source and tests
COPY src ./src
COPY tests ./tests

# Build, test, and package
RUN npm run build && \
    npm test && \
    npm run package


# ---- Runtime stage: serve with nginx ----
FROM nginx:alpine

LABEL maintainer="you@example.com"
LABEL description="2048 game - built and shipped via Jenkins CI/CD"

# Copy packaged static site from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Application environment
ENV APP_ENV=production

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -q --spider http://localhost/ || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
