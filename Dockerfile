# ---------- 1) Build stage ---------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy only package files first
COPY package*.json ./
RUN npm ci

# Copy the rest of your frontend source
COPY . ./
RUN npm run build  # This outputs files to /app/dist

# ---------- 2) Runtime stage -------------------------------------------------
FROM nginx:1.25-alpine

# Copy in your custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built frontend from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

