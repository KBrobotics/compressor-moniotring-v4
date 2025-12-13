# ====== build stage ======
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ====== runtime stage ======
FROM nginx:alpine

# SPA routing (React/Vite) na porcie 80
RUN rm -f /etc/nginx/conf.d/default.conf && \
    printf '%s\n' \
'server {' \
'  listen 80;' \
'  server_name _;' \
'' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' \
> /etc/nginx/conf.d/app.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
