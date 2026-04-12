import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const isProductionDb = process.env.DB_HOST && process.env.DB_HOST.includes('render.com')

function resolvePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: resolvePositiveInt(process.env.DB_POOL_MAX, 20),
  idleTimeoutMillis: resolvePositiveInt(process.env.DB_IDLE_TIMEOUT_MS, 30000),
  connectionTimeoutMillis: resolvePositiveInt(process.env.DB_CONNECTION_TIMEOUT_MS, 5000),
  ssl: isProductionDb
    ? { rejectUnauthorized: false }
    : false
})

export default pool
