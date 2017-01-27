import * as data from './data';
import * as tables from './tables';
import * as database from './database';

const sequencePromises = promises =>
  promises.reduce(
    (promise, promiseFn) => promise.then(promiseFn),
    Promise.resolve(),
  );

const createDatabase = () => {
  const promises = [tables.users, tables.posts, tables.usersFriends]
    .map(table => () => database.getSql(table.create().toQuery()));

  return sequencePromises(promises);
};


const insertData = () => {
  const { users, posts, usersFriends } = data;

  const queries = [
    tables.users.insert(users).toQuery(),
    tables.posts.insert(posts).toQuery(),
    tables.usersFriends.insert(usersFriends).toQuery(),
  ];

  const promises = queries.map(q => () => database.getSql(q));
  return sequencePromises(promises);
}

createDatabase()
  .then(insertData)
  .then(() => {
    console.log({ done: true });
  })
  .catch(console.error);
