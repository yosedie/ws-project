# syntax=docker/dockerfile:1

FROM node:20.9.0-bullseye-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN yarn install --production
EXPOSE 3000
CMD ["npx", "nodemon", "index.js"]