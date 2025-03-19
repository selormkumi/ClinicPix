const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "clinicpix",
  password: "447652$#$",
  port: 5432,
});
 
module.exports = pool;
 