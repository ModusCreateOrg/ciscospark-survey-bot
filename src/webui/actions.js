import { Schema } from 'caminte'
import { promisifyAll } from 'bluebird'

var schema = new Schema('redis', {
  driver     : "redis",
  host       : "localhost",
  port       : "6379",
  database   : "test"
});

const User = schema.define('User', {
    name:     { type: schema.String },
    email:    { type: schema.String },
    joinedAt: { type: schema.Date, default: Date.now },
});

promisifyAll(User, {
  // b/c of this: http://bluebirdjs.com/docs/error-explanations.html#error-cannot-promisify-an-api-that-has-normal-methods
  filter: (name, func, target, passesDefaultFilter) =>
    passesDefaultFilter && !name.match(/Async$/)
})


const listUsers = () => User.allAsync()

export default {
  listUsers,
}
