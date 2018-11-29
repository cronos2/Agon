# Deployment of the app to Heroku

A `Procfile` is necessary. Currently, this is the only content:

```
web: npm run start
```

Which instructs the dyno to start a special *task* named `web` by issuing the associated command. This task is special in the sense that it's able to handle HTTP traffic, which we will certainly need for a web service.

To actually deploy the app to Heroku a GitHub webhook has been configured, so that commits pushed to the `master` branch trigger an automatic deploy on Heroku.
