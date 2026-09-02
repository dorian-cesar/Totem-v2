import { useState, useEffect } from 'react';

function VideoPreviewCard({ videoUrl, videoName, slotNum, showPlayer = true }) {
  const [meta, setMeta] = useState({ duration: 0, width: 0, height: 0, loaded: false, error: false });

  useEffect(() => {
    setMeta({ duration: 0, width: 0, height: 0, loaded: false, error: false });
  }, [videoUrl]);

  const handleLoadedMetadata = (e) => {
    const v = e.target;
    setMeta({
      duration: v.duration || 0,
      width: v.videoWidth || 0,
      height: v.videoHeight || 0,
      loaded: true,
      error: false
    });
  };

  const handleError = () => {
    setMeta({ duration: 0, width: 0, height: 0, loaded: false, error: true });
  };

  if (!videoUrl) {
    return (
      <div style={{ background: '#0f172a60', border: '1px dashed #334155', borderRadius: '8px', padding: '10px 14px', color: '#64748b', fontSize: '0.85rem' }}>
        <span>Slot {slotNum}: Sin vídeo asignado (Vacío)</span>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '12px', display: 'flex', gap: '15px', alignItems: 'center', margin: '8px 0' }}>
      {showPlayer && (
        <video
          src={videoUrl}
          muted
          controls
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          style={{ width: '140px', height: '80px', objectFit: 'cover', borderRadius: '6px', background: '#000', border: '1px solid #1e293b' }}
        ></video>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <strong style={{ color: '#38bdf8', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Slot {slotNum}: {videoName || 'Vídeo Publicitario'}
          </strong>
        </div>
        <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          🔗 {videoUrl}
        </p>

        {meta.loaded && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #0284c7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              📐 {meta.width} x {meta.height} {meta.width >= 3840 ? '(4K UHD)' : meta.width >= 1920 ? '(1080p FHD)' : meta.width > 0 ? '(HD)' : ''}
            </span>
            <span style={{ background: '#1e293b', color: '#eab308', border: '1px solid #ca8a04', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              ⏱️ {meta.duration.toFixed(1)} seg
            </span>
          </div>
        )}
        {meta.error && (
          <span style={{ fontSize: '0.75rem', color: '#f87171' }}>⚠️ Error leyendo metadatos del vídeo</span>
        )}
        {!meta.loaded && !meta.error && (
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>⏳ Leyendo resolución y duración...</span>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [totems, setTotems] = useState([
    {
      id: 1,
      identificador: 'totem-alameda-01',
      ip: '172.26.10.66',
      ubicacion: 'Terminal Alameda - Principal',
      status: 'online',
      videos: [
        { slot: 1, name: 'Promoción Verano Slot 1', url: 'https://vjs.zencdn.net/v/oceans.mp4' },
        { slot: 2, name: 'Promoción Pasajes Slot 2', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { slot: 3, name: 'Vacío', url: '' }
      ]
    }
  ]);

  const [dispositivos, setDispositivos] = useState([]);
  const [selectedTotem, setSelectedTotem] = useState(null);
  const [newTotem, setNewTotem] = useState({ identificador: '', ubicacion: '', selectedDevice: null });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [totemEditForm, setTotemEditForm] = useState({ id: null, identificador: '', ip: '', ubicacion: '', status: 'online' });

  const [videoSlotEdit, setVideoSlotEdit] = useState({ slot: 1, name: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Parámetros configurables desde variables de entorno (.env.local)
  const maxSizeMB = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE_MB) || 15;
  const maxDurationSec = Number(process.env.NEXT_PUBLIC_MAX_VIDEO_DURATION_SEC) || 20;

  useEffect(() => {
    fetchTotemsFromDB();
  }, []);

  const fetchTotemsFromDB = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/totems');
      const data = await res.json();
      if (data.success && data.totems) {
        setTotems(data.totems);
      }
      if (data.success && data.dispositivos) {
        setDispositivos(data.dispositivos);
      }
    } catch (e) {
      console.warn('Usando tótems locales por defecto:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Validación de Tamaño Máximo basado en env
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`❌ El archivo excede el tamaño máximo permitido de ${maxSizeMB} MB. (Tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`);
      e.target.value = '';
      return;
    }

    // 2. Validación de Duración Máxima basada en env
    try {
      setUploading(true);
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      const tempUrl = URL.createObjectURL(file);
      tempVideo.src = tempUrl;

      const duration = await new Promise((resolve) => {
        tempVideo.onloadedmetadata = () => {
          URL.revokeObjectURL(tempUrl);
          resolve(tempVideo.duration);
        };
        tempVideo.onerror = () => {
          URL.revokeObjectURL(tempUrl);
          resolve(0);
        };
      });

      if (duration > maxDurationSec + 0.5) {
        alert(`❌ El vídeo dura ${duration.toFixed(1)} segundos. La duración máxima permitida configurada es de ${maxDurationSec} segundos.`);
        setUploading(false);
        e.target.value = '';
        return;
      }
    } catch (err) {
      console.warn('No se pudo verificar la duración del vídeo:', err);
    }

    // 3. Subida directa a AWS S3 mediante URL firmada (Presigned URL) sin cabeceras restrictivas
    try {
      const res = await fetch(`/api/upload?fileName=${encodeURIComponent(file.name)}`);
      const data = await res.json();

      if (data.success && data.uploadUrl) {
        // Petición PUT limpia directa del navegador a AWS S3
        const uploadRes = await fetch(data.uploadUrl, {
          method: 'PUT',
          body: file
        });

        if (uploadRes.ok) {
          setVideoSlotEdit({
            ...videoSlotEdit,
            name: videoSlotEdit.name || file.name,
            url: data.publicUrl,
            fileName: file.name
          });
          alert(`¡Vídeo ${file.name} subido exitosamente a AWS S3!`);
        } else {
          alert(`Error transfiriendo vídeo a AWS S3 (Código HTTP: ${uploadRes.status})`);
        }
      } else {
        alert('Error al solicitar firma de subida a AWS S3: ' + (data.error || 'Fallo del servidor'));
      }
    } catch (err) {
      alert('Error en la subida: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddTotem = async (e) => {
    e.preventDefault();
    if (!newTotem.identificador) return;
    const totemObj = {
      identificador: newTotem.identificador.trim(),
      ubicacion: newTotem.ubicacion || 'Sin ubicación',
      status: 'online',
      videos: [
        { slot: 1, name: 'Vacío', url: '' },
        { slot: 2, name: 'Vacío', url: '' },
        { slot: 3, name: 'Vacío', url: '' }
      ]
    };

    try {
      const res = await fetch('/api/totems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(totemObj)
      });
      const data = await res.json();
      if (data.success) {
        fetchTotemsFromDB();
      } else {
        setTotems([...totems, { ...totemObj, id: Date.now(), ip: 'Sin IP' }]);
      }
    } catch (err) {
      setTotems([...totems, { ...totemObj, id: Date.now(), ip: 'Sin IP' }]);
    }

    setNewTotem({ identificador: '', ubicacion: '', selectedDevice: null });
    setShowAddModal(false);
  };

  const openEditModal = (totem, e) => {
    if (e) e.stopPropagation();
    setTotemEditForm({
      id: totem.id,
      identificador: totem.identificador,
      ip: totem.ip || '',
      ubicacion: totem.ubicacion || '',
      status: totem.status || 'online',
      videos: totem.videos
    });
    setShowEditModal(true);
  };

  const handleSaveTotemEdit = async (e) => {
    e.preventDefault();
    if (!totemEditForm.identificador) return;

    try {
      const res = await fetch('/api/totems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(totemEditForm)
      });
      const data = await res.json();
      if (data.success && data.totem) {
        fetchTotemsFromDB();
        if (selectedTotem && selectedTotem.id === totemEditForm.id) {
          setSelectedTotem(data.totem);
        }
        alert(`¡Tótem '${totemEditForm.identificador}' actualizado correctamente!`);
      } else {
        alert('Error al guardar datos del Tótem');
      }
    } catch (err) {
      alert('Error guardando cambios del Tótem: ' + err.message);
    }

    setShowEditModal(false);
  };

  const handleDeleteTotem = async (id, identificador, e) => {
    if (e) e.stopPropagation();
    const name = identificador || 'este Tótem';
    if (confirm(`¿Está seguro de eliminar definitivamente el tótem '${name}'?`)) {
      try {
        await fetch(`/api/totems?id=${id}`, { method: 'DELETE' });
      } catch (e) {}

      setTotems(totems.filter((t) => t.id !== id));
      if (selectedTotem && selectedTotem.id === id) {
        setSelectedTotem(null);
      }
      alert(`Tótem '${name}' eliminado con éxito.`);
    }
  };

  const handleSaveVideoSlot = async (e) => {
    e.preventDefault();
    if (!selectedTotem) return;
    const updatedVideos = selectedTotem.videos.map((v) => {
      if (v.slot === videoSlotEdit.slot) {
        return { slot: videoSlotEdit.slot, name: videoSlotEdit.name, url: videoSlotEdit.url };
      }
      return v;
    });

    const updatedTotem = { ...selectedTotem, videos: updatedVideos };

    try {
      await fetch('/api/totems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTotem)
      });
    } catch (e) {}

    const updatedTotems = totems.map((t) => (t.id === selectedTotem.id ? updatedTotem : t));
    setTotems(updatedTotems);
    setSelectedTotem(updatedTotem);
    alert(`¡Video Slot ${videoSlotEdit.slot} guardado correctamente en la BBDD!`);
  };

  const handleClearVideoSlot = async () => {
    if (!selectedTotem) return;
    if (!confirm(`¿Está seguro de vaciar y eliminar el vídeo del Slot ${videoSlotEdit.slot}?`)) return;

    const updatedVideos = selectedTotem.videos.map((v) => {
      if (v.slot === videoSlotEdit.slot) {
        return { slot: videoSlotEdit.slot, name: 'Vacío', url: '' };
      }
      return v;
    });

    const updatedTotem = { ...selectedTotem, videos: updatedVideos };

    try {
      await fetch('/api/totems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTotem)
      });
    } catch (e) {}

    const updatedTotems = totems.map((t) => (t.id === selectedTotem.id ? updatedTotem : t));
    setTotems(updatedTotems);
    setSelectedTotem(updatedTotem);
    setVideoSlotEdit({ slot: videoSlotEdit.slot, name: 'Vacío', url: '' });
    alert(`¡Vídeo del Slot ${videoSlotEdit.slot} eliminado con éxito!`);
  };

  const handleSelectDeviceOption = (ident) => {
    if (!ident) {
      setNewTotem({ identificador: '', ubicacion: '', selectedDevice: null });
      return;
    }
    const dev = dispositivos.find((d) => d.identificador === ident);
    if (dev) {
      setNewTotem({
        identificador: dev.identificador,
        ubicacion: dev.ubicacion || '',
        selectedDevice: dev
      });
    } else {
      setNewTotem({ ...newTotem, identificador: ident });
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '30px', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>📺 Mantenedor de Tótems y Publicidad</h1>
          <p style={{ margin: '5px 0 0', color: '#94a3b8' }}>
            BBDD Central PostgreSQL (AWS RDS): <code>banos-autoservicio-v14.c6xou04wqeof.us-east-1.rds.amazonaws.com</code>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchTotemsFromDB}
            style={{ background: '#334155', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer' }}
          >
            🔄 {loading ? 'Cargando...' : 'Sincronizar BBDD'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Agregar Nuevo Tótem
          </button>
        </div>
      </header>

      {/* Grid de Tótems */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {totems.map((totem) => (
          <div
            key={totem.id}
            onClick={() => {
              setSelectedTotem(totem);
              setVideoSlotEdit(totem.videos[0] || { slot: 1, name: '', url: '' });
            }}
            style={{
              background: selectedTotem?.id === totem.id ? '#1e293b' : '#1e293b90',
              border: selectedTotem?.id === totem.id ? '2px solid #38bdf8' : '1px solid #334155',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0284c7', color: '#fff', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  🏷️ ID Fijo
                </span>
                <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.15rem' }}>{totem.identificador}</h3>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ background: totem.status === 'online' ? '#166534' : '#854d0e', color: totem.status === 'online' ? '#86efac' : '#fef08a', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  🟢 {totem.status}
                </span>
                <button
                  onClick={(e) => openEditModal(totem, e)}
                  title="Editar Datos del Tótem"
                  style={{ background: '#334155', color: '#38bdf8', border: '1px solid #0284c7', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => handleDeleteTotem(totem.id, totem.identificador, e)}
                  title="Eliminar Tótem"
                  style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  🗑️
                </button>
              </div>
            </div>
            <p style={{ margin: '0 0 5px', color: '#cbd5e1', fontSize: '0.9rem' }}>📍 Ubicación: <strong>{totem.ubicacion}</strong></p>
            <p style={{ margin: '0 0 15px', color: '#94a3b8', fontSize: '0.85rem' }}>
              🌐 IP Autodetectada (BBDD): <code>{totem.ip}</code>
            </p>

            <div style={{ borderTop: '1px dashed #334155', paddingTop: '10px' }}>
              <strong style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Vídeos Asignados ({totem.videos ? totem.videos.filter(v => v.url).length : 0}/3):
              </strong>
              <div style={{ marginTop: '8px' }}>
                {totem.videos && totem.videos.map((v) => (
                  <VideoPreviewCard
                    key={v.slot}
                    slotNum={v.slot}
                    videoName={v.name}
                    videoUrl={v.url}
                    showPlayer={selectedTotem?.id === totem.id}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor de Vídeos para Tótem Seleccionado */}
      {selectedTotem && (
        <div style={{ background: '#1e293b', border: '1px solid #38bdf8', borderRadius: '12px', padding: '25px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: 0, color: '#38bdf8' }}>⚙️ Administrar Vídeos para: {selectedTotem.identificador}</h2>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                ID Fijo Permanente: <code>{selectedTotem.identificador}</code> | IP Autodetectada: <code>{selectedTotem.ip}</code> | Ubicación: {selectedTotem.ubicacion}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={(e) => openEditModal(selectedTotem, e)}
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✏️ Editar Campos del Tótem
              </button>
              <button
                onClick={(e) => handleDeleteTotem(selectedTotem.id, selectedTotem.identificador, e)}
                style={{ background: '#991b1b', color: '#fca5a5', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🗑️ Eliminar Tótem
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
            {/* Formulario de Edición */}
            <form onSubmit={handleSaveVideoSlot} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#cbd5e1' }}>Seleccionar Slot de Vídeo:</label>
                <select
                  value={videoSlotEdit.slot}
                  onChange={(e) => {
                    const slotNum = Number(e.target.value);
                    const found = selectedTotem.videos.find((v) => v.slot === slotNum) || { slot: slotNum, name: '', url: '' };
                    setVideoSlotEdit(found);
                  }}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                >
                  <option value={1}>Slot 1 - Vídeo Promocional Principal</option>
                  <option value={2}>Slot 2 - Vídeo Secundario</option>
                  <option value={3}>Slot 3 - Vídeo Terciario</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', color: '#cbd5e1' }}>Nombre / Descripción del Vídeo:</label>
                <input
                  type="text"
                  value={videoSlotEdit.name}
                  onChange={(e) => setVideoSlotEdit({ ...videoSlotEdit, name: e.target.value })}
                  placeholder="Ej. Campaña Verano 2026 - Descuentos"
                  style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>Seleccionar / Cargar Vídeo MP4:</label>

                {/* Opción 1: Buscar y Subir archivo local con validaciones por env */}
                <div style={{ background: '#0f172a', border: '1px dashed #38bdf8', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
                      📁 Seleccionar y subir archivo desde tu equipo:
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#eab308', background: 'rgba(234,179,8,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      ⚠️ Máx. {maxSizeMB} MB | Máx. {maxDurationSec} seg
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    onChange={handleFileUpload}
                    style={{ width: '100%', color: '#94a3b8', fontSize: '0.9rem', cursor: 'pointer' }}
                  />
                  {uploading && (
                    <p style={{ margin: '8px 0 0', color: '#eab308', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      ⏳ Subiendo vídeo directamente a AWS S3...
                    </p>
                  )}
                  {videoSlotEdit.fileName && !uploading && (
                    <p style={{ margin: '8px 0 0', color: '#86efac', fontSize: '0.85rem' }}>
                      ✓ Archivo procesado: <strong>{videoSlotEdit.fileName}</strong>
                    </p>
                  )}
                </div>

                {/* Opción 2: Ingresar URL directamente */}
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#94a3b8' }}>
                    🔗 O dirección/URL guardada del vídeo:
                  </label>
                  <input
                    type="text"
                    value={videoSlotEdit.url}
                    onChange={(e) => setVideoSlotEdit({ ...videoSlotEdit, url: e.target.value })}
                    placeholder="https://totem-publicidad-media.s3.us-east-1.amazonaws.com/videos/campana.mp4"
                    style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{ flex: 2, background: uploading ? '#475569' : '#16a34a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                >
                  💾 Guardar y Asignar Vídeo a este Slot
                </button>
                <button
                  type="button"
                  onClick={handleClearVideoSlot}
                  disabled={uploading}
                  style={{ flex: 1, background: '#991b1b', color: '#fca5a5', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🗑️ Vaciar / Borrar Slot
                </button>
              </div>
            </form>

            {/* Pre-visualización interactiva con resolución y segundos */}
            <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '20px' }}>
              <h3 style={{ margin: '0 0 10px', color: '#38bdf8', fontSize: '1rem' }}>
                🎬 Pre-visualización del Slot {videoSlotEdit.slot} ({selectedTotem.identificador})
              </h3>
              <p style={{ margin: '0 0 15px', color: '#94a3b8', fontSize: '0.85rem' }}>
                Muestra la vista previa del vídeo con su resolución exacta en píxeles y duración total en segundos:
              </p>
              <VideoPreviewCard
                slotNum={videoSlotEdit.slot}
                videoName={videoSlotEdit.name}
                videoUrl={videoSlotEdit.url}
                showPlayer={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal para Agregar Tótem con Selector e Inspección de Dispositivos en BBDD */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 10px', color: '#38bdf8' }}>+ Registrar Nuevo Tótem</h3>
            <p style={{ margin: '0 0 15px', color: '#94a3b8', fontSize: '0.85rem' }}>
              Selecciona uno de los dispositivos autodetectados en la tabla <code>bano_autoservicio.dispositivos</code> o escribe uno manualmente.
            </p>

            {/* Selector de Dispositivos Detectados */}
            {dispositivos.length > 0 && (
              <div style={{ marginBottom: '20px', background: '#0f172a', border: '1px solid #0284c7', borderRadius: '10px', padding: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
                  📡 Dispositivos Registrados en BBDD ({dispositivos.length} encontrados con su IP):
                </label>
                <select
                  value={newTotem.selectedDevice?.identificador || ''}
                  onChange={(e) => handleSelectDeviceOption(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="">-- Seleccionar un Dispositivo Detectado --</option>
                  {dispositivos.map((d) => {
                    const isAlreadyRegistered = totems.some((t) => t.identificador?.toLowerCase() === d.identificador?.toLowerCase());
                    return (
                      <option key={d.id} value={d.identificador}>
                        {isAlreadyRegistered ? '✅ [Ya asignado] ' : '✨ [Disponible] '}
                        ID: {d.identificador} | IP: {d.ip} | Ubicación: {d.ubicacion || 'Sin ubicación'}
                      </option>
                    );
                  })}
                </select>

                {/* Lista visual de Badges / Tarjetas rápidas */}
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
                  {dispositivos.map((d) => {
                    const isSelected = newTotem.identificador === d.identificador;
                    const isAlreadyRegistered = totems.some((t) => t.identificador?.toLowerCase() === d.identificador?.toLowerCase());
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleSelectDeviceOption(d.identificador)}
                        style={{
                          background: isSelected ? '#0284c7' : isAlreadyRegistered ? '#1e293b' : '#0f172a',
                          color: isSelected ? '#fff' : isAlreadyRegistered ? '#94a3b8' : '#38bdf8',
                          border: isSelected ? '1px solid #38bdf8' : '1px solid #334155',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <strong>ID: {d.identificador}</strong> ({d.ip})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleAddTotem} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Identificador Único (Permanente):
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. 1006, 3000 o totem-alameda-02"
                  value={newTotem.identificador}
                  onChange={(e) => setNewTotem({ ...newTotem, identificador: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Ubicación / Sucursal (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="ej. Terminal Sur - Nivel 1 (Se autodetectará de BBDD si existe)"
                  value={newTotem.ubicacion}
                  onChange={(e) => setNewTotem({ ...newTotem, ubicacion: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                />
              </div>

              {/* Caja resumen si se seleccionó un dispositivo */}
              {newTotem.selectedDevice && (
                <div style={{ background: '#16653430', border: '1px solid #16a34a', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', color: '#86efac' }}>
                  <div><strong>🟢 Dispositivo Detectado:</strong> <code>{newTotem.selectedDevice.identificador}</code></div>
                  <div><strong>🌐 Dirección IP:</strong> <code>{newTotem.selectedDevice.ip}</code></div>
                  <div><strong>📍 Ubicación en BBDD:</strong> {newTotem.selectedDevice.ubicacion || 'Sin ubicación'}</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#0284c7', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Guardar y Asignar Tótem
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: '#475569', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Tótem Existent */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #38bdf8', borderRadius: '12px', padding: '30px', width: '420px' }}>
            <h3 style={{ margin: '0 0 10px', color: '#38bdf8' }}>✏️ Editar Campos del Tótem</h3>
            <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '0.85rem' }}>
              Modifica los campos del tótem en la BBDD PostgreSQL (RDS).
            </p>
            <form onSubmit={handleSaveTotemEdit} style={{ display: 'grid', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Identificador Único (Permanente):
                </label>
                <input
                  type="text"
                  required
                  value={totemEditForm.identificador}
                  onChange={(e) => setTotemEditForm({ ...totemEditForm, identificador: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Ubicación / Sucursal:
                </label>
                <input
                  type="text"
                  value={totemEditForm.ubicacion}
                  onChange={(e) => setTotemEditForm({ ...totemEditForm, ubicacion: e.target.value })}
                  placeholder="ej. Terminal Alameda - Nivel 1"
                  style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Dirección IP (Manual / Autodetectada):
                </label>
                <input
                  type="text"
                  value={totemEditForm.ip}
                  onChange={(e) => setTotemEditForm({ ...totemEditForm, ip: e.target.value })}
                  placeholder="ej. 172.26.10.66"
                  style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Estado de Operación:
                </label>
                <select
                  value={totemEditForm.status}
                  onChange={(e) => setTotemEditForm({ ...totemEditForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '6px' }}
                >
                  <option value="online">🟢 Online (Activo)</option>
                  <option value="offline">🔴 Offline (Inactivo)</option>
                  <option value="maintenance">🟡 Mantenimiento</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  💾 Guardar Cambios
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, background: '#475569', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
