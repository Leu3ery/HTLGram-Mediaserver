FROM node:latest

COPY package.json /app/
COPY src /app/
COPY tsconfig.json /app/

WORKDIR /app

RUN npm i
RUN npx tsc

CMD [ "node", "dist/server.js" ]