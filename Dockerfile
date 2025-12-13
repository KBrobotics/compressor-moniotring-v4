# ====== build stage ======
FROM node:20-alpine AS build
WORKDIR /app

# zależności (npm install działa także bez package-lock.json)
COPY package*.json ./
RUN npm install

# kod
COPY . .

# build Vite (generuje /dist)
RUN npm run build


# ====== runtime stage ======
FROM nginx:alpine

# Konfiguracja nginx dla SPA (React) na porcie 80
RUN rm -f /etc/nginx/conf.d/default.conf && \
    printf '%s\n' \
'server {' \
'  listen 80;' \
'  server_name _;' \
'' \
'  root /usr/share/nginx/html;' \
'  index index.html;' \
'' \
'  # SPA routing: gdy nie ma pliku, oddaj index.html' \
'  location / {' \
'    try_files $uri $uri/ /index.html;' \
'  }' \
'}' \
> /etc/nginx/conf.d/app.conf

# statyczne pliki z builda
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
