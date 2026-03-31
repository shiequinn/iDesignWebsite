import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'd1kb8x1fu8rhcnej.cbetxkdyhwsb.us-east-1.rds.amazonaws.com', // or your DB host
  user: 'a9a1kyqcj8r1g7kf',
  password: 'fshfpdflpsym5f0w',
  database: 'xbxm73r0k93viqkl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;