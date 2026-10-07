import mysql, { Pool } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: Pool | undefined;
}

const host = process.env.DB_HOST || "gateway01.ap-southeast-1.prod.aws.tidbcloud.com";
const port = Number(process.env.DB_PORT || 4000);
const user = process.env.DB_USER || "4U3orN9ZTTvTxdv.root";
const password = process.env.DB_PASSWORD || "ozGv9WkNYvjCImfG";
const database = process.env.DB_NAME || "parksmart";
const useSsl = process.env.DB_SSL === "true" || host.includes("tidbcloud.com");

function createPool(): Pool {
  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    timezone: "Z",
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });
}

const pool = globalThis._mysqlPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis._mysqlPool = pool;
}

export default pool;
