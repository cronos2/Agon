# Deploying a Docker container to Heroku

To deploy the Docker container with our app to Heroku we can use Heroku's own registry (see [here](https://devcenter.heroku.com/articles/container-registry-and-runtime)) or we can leverage Heroku's platform power to build the images for us, using our Dockerfile and a little extra file called `heroku.yml`.

This file can actually accomplish many more [build-related tasks](https://devcenter.heroku.com/articles/buildpack-builds-heroku-yml), but we will just use it to build the Docker image for our application for the time being. Note that it can completely replace the `Procfile` file if we want, or they can coexist (with `heroku.yml` taking higher precedence).

The contents of the file in our project are

``` yaml
build:
  docker:
    web: Dockerfile
```
