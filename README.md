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

## 🎵 Música de fondo

Reemplazá `audioURL` en `src/App.jsx` con un enlace a tu canción (Dropbox, Google Drive, etc.) o con la ruta a un archivo local en `public/`.

## 📸 Fotos

Reemplazá los URLs del array `fotosCarrusel` en `src/App.jsx` con tus fotos reales (podés subirlas a [Cloudinary](https://cloudinary.com) gratis).
