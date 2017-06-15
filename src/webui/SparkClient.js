import CiscoSpark from 'ciscospark'

export default class {
  constructor (user) {
    this.user = user
  }

  _sparkClient = () => {
    this.__sparkClient = this.__sparkClient || this._buildSparkClient()
    return this.__sparkClient
  }

  _buildSparkClient = () => {
    const spark = CiscoSpark.init({
      config: {
        credentials: {
          client_secret: process.env.SPARK_OAUTH__CLIENT_SECRET,
          client_id: process.env.SPARK_OAUTH__CLIENT_ID,
        },
      },
    })

    spark.credentials.set({
      authorization: { // TODO: which of these do we actually need?
        access_token: this.user.accessToken,
        refresh_token: this.user.refreshToken,
        token_type: 'Bearer',
      },
    })

    return spark
  }

  listRooms = () => this._sparkClient().rooms.list().then(({items}) => items)
}
