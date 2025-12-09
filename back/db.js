const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

module.exports = {
  connect: async () => {
    try {
      const pool = await sql.connect(config);
      return pool;
    } catch (err) {
      console.error("Database connection failed:", err);
    }
  },
  sql,
};
