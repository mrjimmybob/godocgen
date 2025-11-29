import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const config: sql.config = {
  server: requireEnv("SQL_SERVER"),
  database: requireEnv("SQL_DATABASE"),
  user: requireEnv("SQL_USER"),
  password: requireEnv("SQL_PASSWORD"),

  port: parseInt(requireEnv("SQL_PORT"), 10),

  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export const pool = new sql.ConnectionPool(config);
export const poolConnect = pool.connect();
