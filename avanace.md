Created walkthrough.md

¡Excelente! Me alegro mucho de que la secuencia publicitaria y el mantenedor estén funcionando a la perfección.

### 📋 Resumen de lo implementado:

1. **POS Dinámico (`FormPurchaseDetail.vue`):** 
   * Transbank Real en `prod` (`VITE_APP_GDS_MODE=prod`).
   * POS Simulado en `dev` (`VITE_APP_GDS_MODE=dev`).

2. **Protector de Pantalla Publicitario de 30s (`Totem-v2`):**
   * Se activa tras 30 segundos de inactividad.
   * Reproduce la secuencia completa (Slot 1 ➔ Slot 2 ➔ Slot 3) omitiendo espacios vacíos.
   * Al tocar la pantalla, retorna de forma fluida e instantánea a la vista principal.

3. **Mantenedor Web Multi-Tótem (`mantenedor-totems`):**
   * Desarrollado en Next.js con soporte para explorar y subir archivos MP4 reales a través de streaming binario (`/api/upload`).
   * Conectado a la base de datos central PostgreSQL en AWS RDS (`bano_autoservicio.totems_publicidad`).

