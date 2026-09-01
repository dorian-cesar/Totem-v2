import pool from '../../lib/db';

export default async function handler(req, res) {
  // Cabeceras CORS explicitas
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const schema = process.env.DB_SCHEMA || 'bano_autoservicio';

  // Asegurar que la tabla exista al consultar
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${schema}.totems_publicidad (
        id SERIAL PRIMARY KEY,
        identificador VARCHAR(100) UNIQUE NOT NULL,
        ip VARCHAR(50) NOT NULL,
        ubicacion VARCHAR(255) DEFAULT 'Sin ubicación',
        status VARCHAR(20) DEFAULT 'online',
        videos JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (tableErr) {
    console.warn('[DB] Aviso verificando tabla totems_publicidad:', tableErr.message);
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(`SELECT * FROM ${schema}.totems_publicidad ORDER BY id ASC`);
      return res.status(200).json({ success: true, totems: result.rows });
    } catch (error) {
      console.error('[DB GET Error]:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { identificador, ip, ubicacion, status, videos } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO ${schema}.totems_publicidad (identificador, ip, ubicacion, status, videos)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (identificador) 
         DO UPDATE SET ip = EXCLUDED.ip, ubicacion = EXCLUDED.ubicacion, status = EXCLUDED.status, videos = EXCLUDED.videos, updated_at = NOW()
         RETURNING *`,
        [identificador, ip, ubicacion || 'Sin ubicación', status || 'online', JSON.stringify(videos || [])]
      );
      return res.status(200).json({ success: true, totem: result.rows[0] });
    } catch (error) {
      console.error('[DB POST Error]:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      await pool.query(`DELETE FROM ${schema}.totems_publicidad WHERE id = $1`, [id]);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('[DB DELETE Error]:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}
