import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'd1kb8x1fu8rhcnej.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user: 'a9a1kyqcj8r1g7kf',
  password: 'kapd7rxwuzbqcmlq',
  database: 'xbxm73r0k93viqkl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;