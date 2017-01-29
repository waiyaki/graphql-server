import * as database from './database';
import * as tables from './tables';

export const getNodeById = (nodeId) => {
  const { tableName, dbId } = tables.splitNodeId(nodeId);

  const table = tables[tableName];
  const query = table
    .select(table.star())
    .where(table.id.equals(dbId))
    .limit(1)
    .toQuery();

  return database.getSql(query).then((rows) => {
    if (rows[0]) {
      // eslint-disable-next-line no-param-reassign
      rows[0].__tableName = tableName;
    }
    return rows[0];
  });
};

export const getFriendIdsForUser = (userSource) => {
  const table = tables.usersFriends;
  const query = table
    .select(table.user_id_b)
    .where(table.user_id_a.equals(userSource.id))
    .toQuery();

  return database.getSql(query)
    .then(rows => rows.map((row) => {
      // eslint-disable-next-line no-param-reassign
      row.__tableName = tables.users.getName();
      return row;
    }));
};

export const getUserNodeWithFriends = (nodeId) => {
  const { tableName, dbId } = tables.splitNodeId(nodeId);

  const query = tables
    .users
    .select(tables.usersFriends.user_id_b, tables.users.star())
    .from(
      tables
        .users
        .leftJoin(tables.usersFriends)
        .on(tables.usersFriends.user_id_a.equals(tables.users.id)),
    )
    .where(tables.users.id.equals(dbId))
    .toQuery();

  return database.getSql(query)
    .then((rows) => {
      if (!rows[0]) {
        return undefined;
      }

      /* eslint-disable no-underscore-dangle */
      const __friends = rows.map(({ user_id_b }) => ({
        user_id_b,
        __tableName: tables.users.getName(),
      }));

      const source = {
        id: rows[0].id,
        name: rows[0].name,
        about: rows[0].about,
        __tableName: tableName,
        __friends,
      };
      /* eslint-enable no-underscore-dangle */
      return source;
    });
};
