FROM library/node:8.4

WORKDIR /app

COPY . /app
RUN yarn install --production
RUN yarn heroku-postbuild

CMD ["yarn", "prod"]
