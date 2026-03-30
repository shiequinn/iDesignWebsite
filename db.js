import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  // or individual params: host, user, password, database
});

export default pool;