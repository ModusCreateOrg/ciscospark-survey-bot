# Survey Bot for Webex Teams

[![CircleCI](https://circleci.com/gh/promptworks/ciscospark-survey-bot.svg?style=svg)](https://circleci.com/gh/promptworks/ciscospark-survey-bot)

A self-hosted Cisco Webex Teams bot for taking surveys.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Features

### Create surveys through a web-based user interface.

![Screenshot of creating a new survey](https://user-images.githubusercontent.com/9061/29992153-c486f476-8f62-11e7-843e-2df724b8f47c.png)

### Conducts surveys via Cisco Spark.

![Screenshot of survey being conducted](https://user-images.githubusercontent.com/9061/29992198-cf2c46be-8f63-11e7-950e-8f419f0d1254.png)

### Watch survey results update in real-time.

![Screenshot of results](https://user-images.githubusercontent.com/9061/29992267-835d3066-8f65-11e7-80c3-b724ce3d4dfb.png)

## Setup & Configuration

1. [Create a *new user*](https://web.ciscospark.com/) on Cisco Spark to be the bot. Admittedly, it's untraditional to use a user account, but because of the way the bot works, it needs to be a user and cannot be a bot or an integration.

    1. Once you create a user, go log in at [Cisco Spark for Developers](https://developer.ciscospark.com)
    2. Click on your avatar in the top right hand corner to show your Access Token.

        ![Screenshot of getting your Access Token](https://user-images.githubusercontent.com/9061/30224732-dfbe4e02-949d-11e7-9c83-53e02fefecbb.png)
    3. Copy that token and use it as your `ACCESS_TOKEN` environment variable.

2. As that new user, [create an integration](https://developer.ciscospark.com/add-integration.html):

    1. App icon

        Feel free to use [this image URL](https://user-images.githubusercontent.com/9061/30225018-ea671072-949e-11e7-964a-200ef94f792e.png).

    2. Redirect URI(s)

        You'll want this to be the `PUBLIC_ADDRESS` environment variable with `/auth/spark/callback` at the end.

        E.g. `https://my-test-survey-bot.herokuapp.com/auth/spark/callback`

    3. Scopes

        <!-- pulled from src/webui/auth/sparkScopes.js -->
        Choose the following scopes:

        | Scope                    | Reason for needing it                               |
        | ------------------------ | --------------------------------------------------- |
        | `spark:people_read`      | so OAuth can fetch user info (name, avatar, etc...) |
        | `spark:rooms_read`       | for letting you choose a room to survey             |
        | `spark:memberships_read` | for knowing who is in a room                        |
        | `spark:messages_write`   | for sharing survey results                          |
        | `spark:teams_read`       | for letting you choose a team room to survey        |

    4. Once you create the integration, grab the Client ID and Client Secret.
      These will be the environment variables `SPARK_OAUTH__CLIENT_ID` and `SPARK_OAUTH__CLIENT_SECRET`.



3. Set the following environment variables. If developing locally, you can put these in the `.env` or `.env.local` files:


    | Environment variable         | Description                                                                                                                                                                                                                                                                                                                                                                                                         |
    | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `PUBLIC_ADDRESS`             | the address at which your bot can be reached                                                                                                                                                                                                                                                                                                                                                                        |
    | `ACCESS_TOKEN`               | the access token from the *user* you created                                                                                                                                                                                                                                                                                                                                                                        |
    | `SPARK_OAUTH__CLIENT_ID`     | the client id of the *integration* you created                                                                                                                                                                                                                                                                                                                                                                      |
    | `SPARK_OAUTH__CLIENT_SECRET` | the client secret of the *integration* you created                                                                                                                                                                                                                                                                                                                                                                  |
    | `SPARK_SECRET`               | [secret for validating the origin of webhooks](https://developer.ciscospark.com/webhooks-explained.html#auth) and for encrypting cookies. Generate a random string for this value. If you are using Heroku, this will be generated for you if you use the "Deploy to Heroku" button. In development, feel free to ignore this as one will be generated for you but it will be different every time your app starts. |
    | `REDIS_URL`                  | URL of your Redis server. If you are using Heroku, this will be added for you.                                                                                                                                                                                                                                                                                                                                      |
    | `PORT`                       | the port to run the web server. If you are using Heroku, this will be added for you.                                                                                                                                                                                                                                                                                                                                |
    | `RESTRICT_LOGINS_TO_DOMAINS` | only allow users to log in if they match certain domains. Set to a comma separated list of allowed domain names. E.g. `example.com,example.net,email.example.biz`. Must provide the full domain-- e.g. `bob@mail.example.com` will not be allowed to log in if your list is `example.com`. If not set, it will allow logins with any domain name.                                                                   |

## Deploying on Heroku

Use the "Deploy to Heroku" button above from this repo or a fork of this repo.

## Running the bot via Docker

A Dockerfile has been included to run the bot via Docker. Here are some additional instructions for running the bot via Docker locally.

Put your environment variables in `.env.local` and run via:

    docker build -t my-survey-bot .
    docker run -it --env-file .env.local my-survey-bot

## Development

### Work on the bot

1. Follow the instructions in Setup & Configuration above, with the following notes:

    - Set your `PUBLIC_ADDRESS` env variable to your ngrok URL, e.g. `http://sparksurvey.ngrok.io`
    - The `SPARK_SECRET` is not needed in development.
    - Set the `ALLOW_DEV_LOGIN` to `1` to let you log into the app without needing an internet connection. This will let you create and modify surveys, but will not let you conduct surveys.

1. Install dependencies

        yarn install

1. Start the local development server & redis:

        yarn start

    If you already have Redis running as a deamon or aren't using a local Redis server, do:

        yarn server-dev


1. If using Docker, you can run the image specifying the environment file and
   exposing port 3000:

        docker run -it --env-file .env.local --publish 3000:3000 my-survey-bot

1. Run ngrok (or something like it).

    Because Spark uses webhooks to talk to bots, you must run something like
    ngrok locally to expose your server to the web.  We've included a script to
    do this for you (requires ngrok).

        yarn ngrok

1. Add a Redirect URI to your Spark Integration settings that uses your ngrok URI. E.g.

        https://sparksurvey.ngrok.io/auth/spark/callback

### Tests

Run the tests:

    yarn test

Run the linter:

    yarn lint

Run the test watcher, which will re-run tests after every file change:

    yarn test-watch
