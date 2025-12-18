FROM node:25-alpine AS build
LABEL maintainer="Stille <stille@ioiox.com>"

ENV VERSION 2.0

WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

FROM nginx:1.29-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY . /app
EXPOSE 80
CMD [ "sh", "-c", "/app/start.sh" ]
