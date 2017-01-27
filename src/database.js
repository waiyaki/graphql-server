import sqlite3 from 'sqlite3';

import * as tables from './tables';

export const db = new sqlite3.Database('./db.sqlite3');

export const getSql = query => new Promise((resolve, reject) => {
  db.all(query.text, query.values, (err, rows) => {
    if (err) {
      reject(err);
    } else {
      resolve(rows);
    }
  });
});
