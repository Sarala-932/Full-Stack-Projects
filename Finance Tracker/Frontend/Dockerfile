FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_CLERK_PUBLISHABLE_KEY=pk_test_ZGFzaGluZy1lYXJ3aWctNDUuY2xlcmsuYWNjb3VudHMuZGV2JA
ARG VITE_API_URL=https://finance-tracker-backend-fcxe.onrender.com
ARG VITE_CLERK_SIGN_IN_URL=/sign-in
ARG VITE_CLERK_SIGN_UP_URL=/sign-up

ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLERK_SIGN_IN_URL=$VITE_CLERK_SIGN_IN_URL
ENV VITE_CLERK_SIGN_UP_URL=$VITE_CLERK_SIGN_UP_URL

# Copy package files first (layer caching)
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Build production bundle (outputs to /app/dist)
RUN npm run build

# ─── Stage 2: Serve with Nginx ─────────────────────────────────────
FROM nginx:alpine

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built React files from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
