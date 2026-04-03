import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const isProductionDb = process.env.DB_HOST && process.env.DB_HOST.includes('render.com');

export function isAdminDbConfigured() {
  return Boolean(
    String(process.env.DB_ADMIN_USER || '').trim()
    && String(process.env.DB_ADMIN_PASSWORD || '').trim()
  );
}

const adminPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_ADMIN_USER || process.env.DB_USER,
  password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD,
  ssl: isProductionDb
    ? { rejectUnauthorized: false }
    : false,
});

export default adminPool;
