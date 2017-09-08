export default [
  'spark:people_read',      // required by passport for fetching user info (name, avatar, etc...)
  'spark:rooms_read',       // required by SparkUser for letting you choose a room to survey
  'spark:memberships_read', // required by SparkUser for knowing who is in a room
  'spark:messages_write',   // required by SparkUser for sharing survey results
  'spark:teams_read'        // required by SparkUser for letting you choose a team room to survey
]
