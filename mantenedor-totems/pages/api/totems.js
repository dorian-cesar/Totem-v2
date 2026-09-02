import pool from '../../lib/db';

export default async function handler(req, res) {
  // Cabeceras CORS explícitas
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
        ip VARCHAR(50) DEFAULT 'Sin IP',
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
      // 1. Obtener totems_publicidad cruzado con dispositivos
      const totemsQuery = `
        SELECT 
          t.id, 
          t.identificador, 
          COALESCE(d.ip, t.ip, 'Sin IP') as ip, 
          COALESCE(d.ubicacion, t.ubicacion, 'Sin ubicación') as ubicacion, 
          t.status, 
          t.videos, 
          t.updated_at
        FROM ${schema}.totems_publicidad t
        LEFT JOIN ${schema}.dispositivos d 
          ON LOWER(t.identificador) = LOWER(d.identificador)
        ORDER BY t.id ASC
      `;
      const result = await pool.query(totemsQuery);

      // Sanitizar URLs http:// -> https://
      const sanitizedRows = result.rows.map((row) => {
        if (row.videos && Array.isArray(row.videos)) {
          row.videos = row.videos.map((v) => {
            if (v && v.url && v.url.startsWith('http://')) {
              v.url = v.url.replace(/^http:\/\//i, 'https://');
            }
            return v;
          });
        }
        return row;
      });

      // 2. Obtener lista de dispositivos unicos guardados en la BBDD (para visualizacion y seleccion)
      let dispositivos = [];
      try {
        const devResult = await pool.query(`
          SELECT DISTINCT ON (LOWER(identificador)) 
            id, identificador, ip, ubicacion, ultima_conexion 
          FROM ${schema}.dispositivos 
          ORDER BY LOWER(identificador) ASC, id DESC
        `);
        dispositivos = devResult.rows;
      } catch (devErr) {
        console.warn('[DB] Error consultando lista de dispositivos:', devErr.message);
      }

      return res.status(200).json({ success: true, totems: sanitizedRows, dispositivos });
    } catch (error) {
      console.error('[DB GET Error]:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    let { id, identificador, ip, ubicacion, status, videos } = req.body;

    if (!identificador) {
      return res.status(400).json({ success: false, error: 'El identificador único es requerido.' });
    }

    // Buscar automaticamente la IP y Ubicacion mas reciente en la tabla 'dispositivos' si no viene especificada
    try {
      const devRes = await pool.query(
        `SELECT ip, ubicacion FROM ${schema}.dispositivos WHERE LOWER(identificador) = LOWER($1) ORDER BY id DESC LIMIT 1`,
        [identificador]
      );
      if (devRes.rows.length > 0) {
        if (!ip || ip === 'Sin IP') ip = devRes.rows[0].ip;
        if (!ubicacion || ubicacion === 'Sin ubicación') ubicacion = devRes.rows[0].ubicacion;
      }
    } catch (devErr) {
      console.warn('[DB] No se pudo autocompletar desde la tabla dispositivos:', devErr.message);
    }

    if (!ip) ip = 'Sin IP';

    // Sanitizar URLs de vídeos recibidas a https://
    if (videos && Array.isArray(videos)) {
      videos = videos.map((v) => {
        if (v && v.url && v.url.startsWith('http://')) {
          v.url = v.url.replace(/^http:\/\//i, 'https://');
        }
        return v;
      });
    }

    try {
      let result;
      if (id) {
        result = await pool.query(
          `UPDATE ${schema}.totems_publicidad 
           SET identificador = $1, ip = $2, ubicacion = $3, status = $4, videos = $5, updated_at = NOW()
           WHERE id = $6
           RETURNING *`,
          [identificador, ip, ubicacion || 'Sin ubicación', status || 'online', JSON.stringify(videos || []), id]
        );
      } else {
        result = await pool.query(
          `INSERT INTO ${schema}.totems_publicidad (identificador, ip, ubicacion, status, videos)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (identificador) 
           DO UPDATE SET ip = EXCLUDED.ip, ubicacion = EXCLUDED.ubicacion, status = EXCLUDED.status, videos = EXCLUDED.videos, updated_at = NOW()
           RETURNING *`,
          [identificador, ip, ubicacion || 'Sin ubicación', status || 'online', JSON.stringify(videos || [])]
        );
      }

      return res.status(200).json({ success: true, totem: result.rows[0] });
    } catch (error) {
      console.error('[DB POST/PUT Error]:', error.message);
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
