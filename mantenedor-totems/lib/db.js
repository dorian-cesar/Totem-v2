import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'banos-autoservicio-v14.c6xou04wqeof.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'c1*!c%!GCfGZ54;i+U~*vUrv_+Cg4Cpr',
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
