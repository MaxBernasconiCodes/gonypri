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

### Opción B — Vercel

```bash
npm install -g vercel
vercel
```

Seguí los pasos del CLI y te da una URL pública.

---

## ✉️ Formularios (RSVP y Música)

Para recibir los datos de los formularios por email:

1. Creá cuenta gratuita en [formspree.io](https://formspree.io)
2. Creá 2 formularios: "RSVP Boda" y "Sugerencias Música"
3. En `src/App.jsx`, reemplazá las líneas:
   ```js
   formspreeRSVP:   'https://formspree.io/f/YOUR_RSVP_ID',
   formspreeMusica: 'https://formspree.io/f/YOUR_MUSIC_ID',
   ```
   con los endpoints reales de tus formularios.

---

## 🎵 Música de fondo

Reemplazá `audioURL` en `src/App.jsx` con un enlace a tu canción (Dropbox, Google Drive, etc.) o con la ruta a un archivo local en `public/`.

## 📸 Fotos

Reemplazá los URLs del array `fotosCarrusel` en `src/App.jsx` con tus fotos reales (podés subirlas a [Cloudinary](https://cloudinary.com) gratis).
