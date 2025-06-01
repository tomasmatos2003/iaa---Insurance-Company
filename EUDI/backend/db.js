const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'eudi_wallet',
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ MySQL connected');
});

module.exports = db;
