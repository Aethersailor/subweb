FROM node:26-alpine AS build
LABEL maintainer="Aethersailor"

ARG APP_REVISION=local
ENV APP_REVISION=$APP_REVISION

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run check

FROM nginx:1.31.3-alpine
LABEL org.opencontainers.image.source="https://github.com/Aethersailor/subweb"

COPY --from=build /app/dist /usr/share/nginx/html
COPY start.sh /app/start.sh
COPY public/conf/config_static.js /app/config_static.js
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
RUN chmod 0755 /app/start.sh

EXPOSE 80
ENTRYPOINT ["/app/start.sh"]
