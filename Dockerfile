# ---- Build stage -----------------------------------------------------------
FROM oven/bun:1-alpine AS build
WORKDIR /app

# Install deps first so this layer is cached when only source changes.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Baked into the bundle at build time (Vite env vars are compile-time only).
# Defaults to the same-origin "/api" convention used when nginx proxies to the backend.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN bun run build

# ---- Runtime stage ----------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Where nginx forwards /api requests; override at `docker run -e` time to
# point at the ims-backend container/service.
ENV BACKEND_URL=http://backend:3000

EXPOSE 80
