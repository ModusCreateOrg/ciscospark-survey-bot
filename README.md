# Survey Bot for Cisco Spark

<!-- [![CircleCI](https://circleci.com/gh/promptworks/ciscospark-jira.svg?style=svg)](https://circleci.com/gh/promptworks/ciscospark-jira) -->

A self-hosted Cisco Spark bot for taking surveys.

<!-- [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy) -->

# Features

Create surveys through a web-based user interface.

[ screenshot of creating a survey ]

Conducts surveys via Cisco Spark.

[ screenshot of spark survey ]

Watch survey results update in real-time.

[ screenshot of results page ]

<!-- how does one do this 👇 ? -->
<!-- ![example use](https://user-images.githubusercontent.com/1062277/27293924-d3e1b5b2-54e5-11e7-8243-5fc8fa1cdd3a.png) -->

## Setup & Configuration

1. [Create a *new user*] on Cisco Spark to be the bot. Admittedly, it's untraditional to use a user account, but because of the way the bot works, it needs to be a user and cannot be a bot or an integration.

2. As that new user, [create an integration].

3. Set the following environment variables. If developing locally, you can put these in the `.env` or `.env.local` files:

    * `PUBLIC_ADDRESS` - the address at which your bot can be reached
    * `ACCESS_TOKEN` - the access token from the *user* you created
    * `SPARK_SECRET` - [secret for validating the origin of
      webhooks](https://developer.ciscospark.com/webhooks-explained.html#auth)
    * `SPARK_OAUTH__CLIENT_ID` - the client id of the *integration* you created
    * `SPARK_OAUTH__CLIENT_SECRET` - the client secret of the *integration* you created

## Deploying on Heroku

This app is set up to be deployed to Heroku with little work.
If deplying to Heroku, make sure to do the following:

* Add the Redis addon

        heroku addons:create heroku-redis:hobby-dev

* Set your `PUBLIC_ADDRESS` environment variable to the url of your Heroku app. E.g.:

        heroku config:add PUBLIC_ADDRESS=https://my-spark-bot.herokuapp.com

## Running the bot via Docker

A Dockerfile has been included to run the bot via Docker. Here are some additional
instructions for running the bot via Docker locally.

* Put your environment variables in `.env.local` and run via:

        docker build -t my-survey-bot .
        docker run -it --env-file .env.local my-survey-bot

## Development

### Work on the bot

1. Follow the instructions in Setup & Configuration above.

1. Install dependencies

        yarn install

1. Start the local development server

        yarn start

1. If using Docker, you can run the image specifying the environment file and
   exposing port 3000:

        docker run -it --env-file .env.local --publish 3000:3000 my-survey-bot

1. Run ngrok (or something like it).

    Because Spark uses webhooks to talk to bots, you must run something like
    ngrok locally to expose your server to the web.  We've included a script to
    do this for you (requires ngrok)

        yarn ngrok


### Tests

Run the tests:

    yarn test

Run the test watcher, which will re-run tests after every file change:

    yarn test-watch
