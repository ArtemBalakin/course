FROM node:24.14.1-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
RUN mkdir /data && chown node:node /data
USER node
CMD ["node", "src/server.js"]
