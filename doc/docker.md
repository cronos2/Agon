# Dockerizing the application

The base image selected for the application container is [`node`](https://hub.docker.com/r/library/node/), maintained by the very [NodeJS community](https://github.com/nodejs/docker-node). This image is based on Debian but there's also an Alpine version (`node:alpine`) which may be considered as a replacement somewhere down the road.

We will need a Dockerfile to describe how to turn our current state to a Docker image:

``` dockerfile
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

```

To build the image we can use the `docker-build` command:

``` shell
docker build -t cronos2/Agon .
```

Finally, we push the image to the Docker Hub registry:

``` shell
docker push cronos2/Agon
```

Alternatively, to make things easier, we can configure an automated build from Docker Hub that will get triggered when we push to the GitHub repository. You can check this is the case in the [image's detail page](https://hub.docker.com/r/cronos2/agon/).
