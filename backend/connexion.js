const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'projet_mobile_db',
  password: 'Frites124',
  port: 5432,
});

module.exports = pool;
