# Casamiento Priki & Gonza 💍

Invitación de boda digital construida con **Vite + React**.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) en el navegador.

## Build de producción

```bash
npm run build
```

La carpeta `dist/` contiene el sitio listo para subir.

---

## 🚀 Cómo deployar (gratis)

### Opción A — Netlify (recomendado)

**Sin cuenta de GitHub:**
1. Corré `npm run build`
2. Entrá a [netlify.com](https://netlify.com) → *Log in* → *Add new site* → **Deploy manually**
3. Arrastrá la carpeta `dist/` al recuadro
4. ¡Listo! Te da una URL como `https://priki-gonza-xxxxx.netlify.app`
5. Podés cambiarla a `priki-gonza` en *Site settings → Change site name*

**Con GitHub (auto-deploy):**
1. Subí el proyecto a un repo de GitHub
2. Conectá el repo en Netlify → Build command: `npm run build` → Publish dir: `dist`
3. Si usás la sección de administración (ver abajo), configurá las variables de entorno en *Site settings → Environment variables*.

### Opción B — Vercel

```bash
npm install -g vercel
vercel
```

Seguí los pasos del CLI y te da una URL pública.

---

## ✉️ Formularios (RSVP y Música) — Netlify Forms

Los formularios **Confirmar asistencia** y **Sugerir canción** se envían a **Netlify Forms**. No hace falta configurar nada extra: al hacer deploy en Netlify, los formularios se registran solos (están en `index.html` con `data-netlify="true"`).

Las respuestas se pueden ver en el **dashboard de Netlify** (pestaña *Forms*) o en la **sección de administración** del sitio.

### Sección de administración

Para ver las respuestas desde la propia web (sin entrar al dashboard de Netlify), entrá a:

**`https://tu-sitio.netlify.app/admin`**

La primera vez te pedirá una **clave de administración**. Para que funcione, en Netlify tenés que definir estas variables de entorno (*Site settings → Environment variables*):

| Variable | Descripción |
|----------|-------------|
| `ADMIN_SECRET` | La clave que querés usar para entrar a `/admin` (ej. una contraseña larga y segura). |
| `NETLIFY_SITE_ID` | El **API ID** del sitio. Lo ves en *Site configuration → General → Site information*. |
| `NETLIFY_AUTH_TOKEN` | Un **Personal access token** de Netlify: en tu cuenta Netlify → *User settings → Applications → Personal access tokens* → *New access token* (con permiso de acceso a la API). |

Sin estas variables, los formularios siguen funcionando y las respuestas se ven en la pestaña *Forms* del dashboard de Netlify; solo la página `/admin` no podrá cargar las respuestas por API.

---

## 📷 Álbum de fotos (Google Drive)

La sección **Sumá tus fotos al álbum** permite que los invitados suban fotos desde la misma página; las fotos se guardan en una carpeta de **Google Drive** vuestra usando la API de Drive (sin que el invitado tenga cuenta Google).

### Importante: usar un Drive compartido (Shared Drive)

Las **cuentas de servicio no tienen espacio propio** en Google Drive. Si creás una carpeta en **Mi unidad** y la compartís con la cuenta de servicio, Google puede devolver *"Service Accounts do not have storage quota"*. La solución es usar un **Drive compartido** (Shared Drive):

1. En **Google Drive** (drive.google.com), en el menú lateral: **Nuevo** → **Drive compartido** (o *Shared drive*).
2. Poné un nombre (ej. "Álbum Casamiento") y crealo.
3. Dentro del Drive compartido, creá una **carpeta** (ej. "Fotos invitados") y abrila.
4. Copiá el **ID de esa carpeta** de la URL:  
   `https://drive.google.com/drive/folders/ESTE_ES_EL_ID`
5. En el Drive compartido, **Compartir** (o gestionar miembros): agregá el **email de la cuenta de servicio** (el `client_email` del JSON, tipo `xxx@proyecto.iam.gserviceaccount.com`) con rol **Editor** o **Administrador de contenido**.

Si no ves la opción "Drive compartido", puede que tu cuenta sea solo personal (Gmail). En ese caso probá desde una cuenta Google Workspace o buscá en la ayuda de Google cómo crear un Shared Drive con tu tipo de cuenta.

### Configuración en Google Cloud

1. Entrá a [Google Cloud Console](https://console.cloud.google.com/) y creá un proyecto (o usá uno existente).
2. Activá la **Google Drive API**: *APIs y servicios* → *Biblioteca* → buscá "Google Drive API" → *Activar*.
3. Creá una **cuenta de servicio**: *APIs y servicios* → *Credenciales* → *Crear credenciales* → *Cuenta de servicio*. Dale un nombre (ej. "album-casamiento") y creala. Luego entrá a la cuenta de servicio → pestaña *Claves* → *Agregar clave* → *Crear clave nueva* → JSON. Se descarga un archivo JSON.
4. Usá la **carpeta dentro del Drive compartido** (paso 4 arriba) como `GDRIVE_FOLDER_ID`.
5. Añadí la cuenta de servicio al Drive compartido como en el paso 5 arriba.

### Variables de entorno en Netlify

En *Site settings → Environment variables* agregá:

| Variable | Descripción |
|----------|-------------|
| `GDRIVE_FOLDER_ID` | El ID de la **carpeta dentro del Drive compartido** donde se guardarán las fotos. |
| `GDRIVE_SERVICE_ACCOUNT_JSON` | El contenido **completo** del archivo JSON de la cuenta de servicio. Podés pegarlo con saltos de línea; el código los normaliza. |

**Importante:** El JSON es sensible. No lo subas al repo; solo en variables de entorno de Netlify.

Las fotos subidas aparecerán en esa carpeta con nombres tipo `Nombre_2026-03-10_14-30-45_1.jpg`. Límite por foto: **5 MB** (límite de Netlify por request).

---

## 🎵 Música de fondo

Reemplazá `audioURL` en `src/App.jsx` con un enlace a tu canción (Dropbox, Google Drive, etc.) o con la ruta a un archivo local en `public/`.

## 📸 Fotos

Reemplazá los URLs del array `fotosCarrusel` en `src/App.jsx` con tus fotos reales (podés subirlas a [Cloudinary](https://cloudinary.com) gratis).
