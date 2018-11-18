FROM node:10

ENV NODE_ENV production

USER node

RUN mkdir -p /home/node/agon  # avoid permission conflicts
WORKDIR /home/node/agon

COPY app.js package.json package-lock.json ./
COPY img ./img
COPY src ./src

RUN npm install

CMD ["node", "app.js"]

EXPOSE $PORT
