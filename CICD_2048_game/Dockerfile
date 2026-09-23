# ---- Build stage: validate & assemble static assets ----
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY tests ./tests
RUN npm run build && npm test && npm run package

# ---- Runtime stage: serve with nginx ----
FROM nginx:alpine
LABEL maintainer="you@example.com"
LABEL description="2048 game - built and shipped via Jenkins CI/CD"

# Copy packaged static site from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Environment variable example (configurable at `docker run -e APP_ENV=...`)
ENV APP_ENV=production

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
