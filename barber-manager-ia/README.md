# Barber Manager IA

Sistema de gestión para peluquerías (clientes, ventas, servicios, productos, agenda,
estadísticas) construido con React + Vite + Firebase + Tailwind, preparado para
escalar a SaaS multi-tenant y para integrarse con WhatsApp vía n8n + Whisper.

## Estado actual

✅ **Implementado y funcional:**
- Arquitectura completa del proyecto (carpetas, capas, convenciones)
- Autenticación real con Firebase (roles `admin` / `empleado`)
- Rutas protegidas por sesión y por rol
- Layout general (Sidebar + Topbar) con navegación dinámica según rol
- Dashboard con métricas 100% reales (ventas del día/mes, clientes, VIP,
  ingresos por semana, servicios y productos más vendidos, actividad reciente)
- Módulo **Clientes**: CRUD completo (crear, editar, eliminar, buscar, filtrar VIP/estado)
- Módulo **Servicios**: CRUD completo (nombre, precio, duración, descripción, estado)
- Módulo **Productos**: CRUD completo (marca, precio, costo, ganancia automática,
  stock con alerta de stock bajo, categoría, código, proveedor, imagen)
- Módulo **Ventas**: selección de cliente (o consumidor final), selección múltiple
  de servicios y productos con cantidades, descuento %, método de pago,
  observaciones. Cálculo automático de subtotal/descuento/total/ganancia.
  Al confirmar, se descuenta el stock de productos y se actualizan las
  visitas/total gastado/última visita del cliente en un único update atómico.
- Sistema de diseño (Button, Card, Input, Badge, Modal, Spinner) estilo Stripe/Linear
- PWA básica (manifest + iconos)
- Endpoint interno (`src/services/api/ventaPorAudioEndpoint.js`) preparado para
  recibir el JSON de n8n, con validación y guardado en la base de datos — **sin
  conectar WhatsApp todavía**, tal como se pidió.
- Módulo **Agenda**: turnos con cliente, servicio, fecha, hora, estado
  (Pendiente/Confirmado/Cancelado/Finalizado) y notas/recordatorio. Vista
  agrupada por día, con cambio rápido de estado desde la misma lista.
- Módulo **Estadísticas**: facturación por mes, horas pico, métodos de pago,
  clientes nuevos vs. recurrentes — todo calculado en tiempo real sobre los
  datos de Ventas y Clientes.
- Módulo **Configuración**: datos de la peluquería (nombre, logo, dirección,
  teléfono, horario, redes sociales, métodos de pago, impuesto), guardados en
  un único nodo `configuracion/general`.

✅ **Los 8 módulos del brief original están completos y funcionales.**
Lo único que queda explícitamente afuera (tal como se pidió) es la conexión
real con WhatsApp — está preparada pero no conectada.

> **Nota sobre la base de datos:** el proyecto usa **Firebase Realtime Database**
> en vez de Firestore. Motivo: Firestore exige activar el plan de pago "Blaze"
> (con tarjeta cargada) aunque no se gaste nada, mientras que Realtime Database
> es 100% gratis desde el plan "Spark" por defecto, sin pedir método de pago.
> Si en el futuro se prefiere Firestore (mejores consultas/filtros para un
> catálogo grande), la capa de datos está aislada en `src/firebase/database.js`
> y los `services/*`, así que migrar no afecta a componentes ni páginas.

## Arquitectura de carpetas

```
src/
  firebase/       # config.js, auth.js, database.js (única capa que toca Firebase)
  context/        # AuthContext (usuario, rol, loading)
  routes/         # AppRoutes, ProtectedRoute
  hooks/          # hooks reutilizables (useClientes, ...)
  services/       # lógica de negocio + acceso a datos por módulo
    api/          # endpoints internos (preparación WhatsApp/n8n)
  components/
    ui/           # Button, Card, Input, Badge, Modal, Spinner
    layout/       # Sidebar, Topbar, DashboardLayout
    dashboard/    # StatCard, RevenueChart
    clientes/     # ClienteForm, ClienteTable
  pages/          # una página por ruta
  utils/          # formatters, constants
```

## Setup

```bash
npm install
cp .env.example .env   # completar con tus credenciales de Firebase
npm run dev
```

### Firebase necesario

1. Crear proyecto en Firebase Console (plan gratuito "Spark", no hace falta tarjeta).
2. Activar **Authentication** (método Email/Password).
3. Activar **Realtime Database** (NO Firestore — ver nota más arriba). Al crearla
   elegí una ubicación y, para no dejarla abierta a cualquiera durante el
   desarrollo, arrancá en "modo bloqueado" (reglas que niegan todo) o pegá
   directamente las reglas de la sección siguiente.
4. Activar **Storage** (para logo, imágenes de productos, etc.).
5. Copiar la **URL de la base de datos** (arriba de la pestaña "Datos" en
   Realtime Database, algo como `https://tu-proyecto-default-rtdb.firebaseio.com`)
   en la variable `VITE_FIREBASE_DATABASE_URL` del `.env`.
6. Crear el primer usuario admin:
   - **Authentication → Users → Add user** (email + contraseña).
   - Copiar el **UID** generado.
   - **Realtime Database → Datos** → crear manualmente:
     ```
     usuarios/{uid} = { email, nombre, rol: "admin", activo: true }
     ```
     (el `uid` debe ser exactamente el mismo que el del usuario de Authentication).

### Reglas de seguridad de Realtime Database (recomendadas)

Por defecto Firebase suele proponer una regla de prueba con fecha de
vencimiento (algo como `"now < 1787367600000"`), que deja todo abierto hasta
esa fecha y después bloqueado por completo. Para este proyecto conviene
reemplazarla por reglas basadas en autenticación, pegando esto en
**Realtime Database → Reglas**:

```json
{
  "rules": {
    "usuarios": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "clientes": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "servicios": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "productos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "ventas": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "turnos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "configuracion": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

Esto exige estar autenticado para leer o escribir cualquier dato (ya cubre lo
esencial). Diferenciar permisos por rol (admin vs empleado) directamente en
las reglas es un paso posterior, ya que Realtime Database no puede validar el
rol sin una lectura extra a `/usuarios/{uid}/rol` dentro de la misma regla —
se puede agregar cuando el proyecto esté por salir a producción.

## Preparación para WhatsApp + n8n + Whisper

El endpoint interno vive en `src/services/api/ventaPorAudioEndpoint.js`. Cuando
se quiera conectar WhatsApp, los pasos serán:

1. Crear una Firebase Cloud Function HTTPS que reciba el POST de n8n.
2. Esa function importa y llama a `procesarVentaDesdeAudio(payload)`.
3. n8n hace: WhatsApp (audio) → Whisper (transcripción) → parseo a JSON → POST a la function.

No se requiere tocar el frontend para esa integración: las ventas creadas por
audio aparecerán directamente en el módulo de Ventas con estado `pendiente_revision`.

## Roadmap hacia SaaS multi-tenant

- Agregar `peluqueriaId` a cada nodo y a las reglas de Realtime Database.
- Migrar a subcolecciones por peluquería (`peluquerias/{id}/clientes/...`).
- Panel de super-admin para gestionar altas de peluquerías.
- Facturación/planes (Stripe).
