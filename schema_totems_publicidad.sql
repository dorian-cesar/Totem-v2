-- Script SQL para creación de tabla de gestión de publicidad por tótem
CREATE TABLE IF NOT EXISTS bano_autoservicio.totems_publicidad (
    id SERIAL PRIMARY KEY,
    totem_identificador VARCHAR(100) NOT NULL,
    totem_ip VARCHAR(50),
    video_slot INT CHECK (video_slot BETWEEN 1 AND 3),
    video_url TEXT NOT NULL,
    video_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_totem_slot UNIQUE (totem_identificador, video_slot)
);

-- Ejemplo de inserción de datos de prueba
INSERT INTO bano_autoservicio.totems_publicidad (totem_identificador, totem_ip, video_slot, video_url, video_name)
VALUES 
    ('totem-alameda-01', '192.168.1.50', 1, 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'Promoción Verano Slot 1'),
    ('totem-alameda-01', '192.168.1.50', 2, 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'Promoción Pasajes Slot 2')
ON CONFLICT (totem_identificador, video_slot) DO UPDATE 
SET video_url = EXCLUDED.video_url, video_name = EXCLUDED.video_name, updated_at = NOW();
