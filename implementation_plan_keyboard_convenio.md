# Plan de Implementación: teclado numérico para RUT, cierre automático del teclado y bloqueo del teclado en validación de convenio

## Objetivo
Ajustar la UX del flujo de selección de viaje en la pantalla de origen/destino para que:
1. El campo de RUT abra un teclado numérico y no permita ingreso de letras.
2. Al elegir una ciudad o confirmar una selección, el teclado virtual se cierre automáticamente.
3. Al entrar al cuadro de validación de convenio y responder “No”, el teclado no se muestre.

## Alcance técnico
El trabajo principal se concentra en el componente de flujo de viaje:
- [Totem-v2/src/components/travel_selection/OriginDestinationCity.vue](Totem-v2/src/components/travel_selection/OriginDestinationCity.vue)
- El selector de ciudades reutilizado en [Totem-v2/src/components/Select.vue](Totem-v2/src/components/Select.vue)

## Requerimientos de negocio

### 1) Teclado numérico en RUT
- El campo del RUT debe admitir solo caracteres numéricos, punto, guion y la K o el valor válido del dígito verificador.
- En el navegador/táctil, el campo debe preferir un teclado numérico con `inputmode="numeric"` o `type="tel"`.
- Debe ser posible bloquear cualquier letra y descartar entrada no esperada con una limpieza del valor en `onInputRut()`.

### 2) Cierre automático del teclado al seleccionar ciudad
- Cuando el usuario elige origen o destino, el teclado del selector de ciudades no debe seguir “abierto” visualmente.
- La selección debe disparar un evento de cierre del teclado y el estado `mostrarTeclado` debe volver a `false`.
- El componente de lista de ciudades debe producir `blur()` en el input de búsqueda para cerrar el teclado del SO y evitar el foco repetido.

### 3) Validación de convenio y respuesta “No”
- En el cuadro de validación de convenio, si el usuario responde `No`, el teclado virtual no debe mostrarse.
- Debe existir un guard `if (respuesta === 'NO') this.ocultarTeclado()`.
- El patrón de validación debe no reabrir el teclado en una navegación de vuelta o rerender.

## Mejoras sugeridas

Adicionales al alcance inmediato, se recomienda hacer también esto:
1. Unificar el acceso a `rut` desde `localStorage` y `Vuex` para no duplicar la fuente de verdad.
2. Hacer el formulario de RUT más robusto con `maxlength` de 12 caracteres y sanitización antes del `formatearRut`.
3. Generar un `state` de `mostrarTeclado` global para que el selector de ciudades y el flujo de convenio se comporten de manera consistente.
4. Evitar que el teclado reaparezca al navegar entre pasos, usando `beforeRouteLeave` o `destroyed()` para borrar la referencia visual del teclado.
5. Definir un `keyboardMode` (`numbersOnly`, `alphabetic`, `convenioNoKeyboard`) para unificar el comportamiento por contexto.
6. Añadir un test de UI manual con los escenarios: RUT sin letras, selección de ciudad y cierre del teclado, respuesta “No” en convenio.

## Plan de implementación

### Fase 1: Preparación
1. Revisar el flujo principal de `OriginDestinationCity.vue` y localizar los puntos del `RUT`, `v-select` y `toggleConvenio()`.
2. Confirmar el componente de `Select.vue` sea el único lugar que recibe `@selectedStatus` y el evento `@input`.
3. Decidir el control: el teclado virtual se ocultará desde `OriginDestinationCity` o desde `Select.vue` con un evento `closeKeyboard`.

### Fase 2: RUT – teclado numérico
1. Ajustar el `<b-form-input>` del campo RUT para usar `inputmode="numeric"` y dejar el patrón de entrada de solo números, `-`, `.` y `K`.
2. Reforzar la entrada con `onInputRut()` para limpiar el valor en caso de letra y aplicar el formato del RUT.
3. Añadir `_sanitizeRut()` para bloquear cualquier carácter no permitido antes de `formatearRut()`.

### Fase 3: Ciudad – cerrar teclado
1. Incluir un `@selectedStatus`/`@close` del `v-select` para emitir el evento del cierre en `OriginDestinationCity`.
2. Introducir `ocultarTeclado()` como punto central del cierre.
3. En `Select.vue`, hacer `blur()` del input interno del select y emitir un status `close` al cerrar la lista.

### Fase 4: Convenio – no abrir teclado con “No”
1. Detectar el flujo del banner o la ventana de validación del convenio.
2. Introducir un guard de UI en la respuesta negativa para `mostrarTeclado = false`.
3. Asegurar que el botón “No” no dispare un focus en el input RUT.

### Fase 5: Verificación
1. Iniciar el flujo en el totem y abrir el paso de origen/destino.
2. Validar que el input RUT solo acepte teclado numérico y no reciba letras.
3. Confirmar que al escoger ciudad el teclado desaparece.
4. Confirmar que al elegir “No” en validación de convenio el soft keyboard no se abre.
5. Ejecutar `npm run build` del frontend para verificar compilación.

## Riesgos
- Cambiar el tipo de teclado nativo en el navegador puede afectar el campo de teclado del sistema operativo.
- Ocultar el soft keyboard en `Select.vue` debe hacerse con `blur()` y no con un `display: none` del DOM, para conservar la lógica de `v-select`.
- El flujo de validación de convenio usa `RUT` o `código`; ambos modos deben mantener el mismo enfoque de entrada y no abrir el teclado en las respuestas negativas.

## Evidencia de verificación
- Build del frontend usando `npm run build` en el repo de `Totem-v2`.
- Revisión manual del flujo en `OriginDestinationCity.vue` para escenario de RUT, ciudades y convenio.
