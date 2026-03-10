import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Gift, Heart, X, Volume2, VolumeX, Music2,
  CalendarHeart, ChevronLeft, ChevronRight, MapPin, Copy, Check,
  Share2, UsersRound, Shirt, Images, ImagePlus, CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CONFIG } from './config';

// ─── UTILIDADES ───────────────────────────────────────────────────

function descargarICS() {
  const inicio = '20260725T210000';
  const fin = '20260726T050000';
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Priki & Gonza//Wedding//ES',
    'BEGIN:VEVENT',
    `DTSTART;TZID=America/Argentina/Buenos_Aires:${inicio}`,
    `DTEND;TZID=America/Argentina/Buenos_Aires:${fin}`,
    'SUMMARY:💍 Casamiento Priki & Gonza',
    `LOCATION:${CONFIG.lugar}`,
    'DESCRIPTION:¡Nos casamos! Ceremonias de boda y recepción.',
    `URL:${CONFIG.ubicacionURL}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'casamiento-priki-gonza.ics';
  a.click();
  URL.revokeObjectURL(url);
}

function lanzarConfetti() {
  const colors = ['#f9a8b8', '#8b4552', '#fce4ec', '#e8b4bc', '#fff'];
  const opts = { particleCount: 80, spread: 70, colors, origin: { y: 0.6 } };
  confetti(opts);
  setTimeout(() => confetti({ ...opts, origin: { y: 0.5, x: 0.3 } }), 200);
  setTimeout(() => confetti({ ...opts, origin: { y: 0.5, x: 0.7 } }), 400);
}

// ─── REVEAL ON SCROLL ─────────────────────────────────────────────
const RevealOnScroll = ({ children, delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(e.target); } },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms`, transition: 'opacity 0.9s ease, transform 0.9s ease', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)' }}>
      {children}
    </div>
  );
};

// ─── PÉTALOS (valores calculados una sola vez) ────────────────────
const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  dur: 12 + Math.random() * 14,
  delay: Math.random() * 12,
  size: 10 + Math.random() * 8,
}));

const FallingPetals = () => (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} aria-hidden="true">
    {PETALS.map(p => (
      <div key={p.id} style={{
        position: 'absolute', top: '-5%',
        left: `${p.left}%`,
        width: p.size, height: p.size,
        background: 'rgba(249,168,184,0.35)',
        borderRadius: '50% 10% 50% 10%',
        animation: `fall ${p.dur}s linear ${p.delay}s infinite`,
      }} />
    ))}
  </div>
);

// ─── BOTÓN COPIAR ALIAS ───────────────────────────────────────────
const CopyAlias = ({ alias }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(alias).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 600, color: copied ? '#22c55e' : '#3d2c2c', transition: 'color 0.3s' }}>
      {alias}
      {copied ? <Check size={15} color="#22c55e" /> : <Copy size={15} color="#8b4552" />}
    </button>
  );
};

// ─── COMPARTIR POR WHATSAPP ───────────────────────────────────────
const ShareWhatsApp = () => {
  const url = encodeURIComponent(window.location.href);
  const msg = encodeURIComponent(`💍 ¡Estás invitado al casamiento de Priki & Gonza! Mirá la invitación: `);
  return (
    <a href={`https://wa.me/?text=${msg}${url}`} target="_blank" rel="noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.4rem', background: '#25D366', color: '#fff', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,211,102,0.35)', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <Share2 size={16} /> Compartir invitación
    </a>
  );
};

// ─── CARRUSEL ─────────────────────────────────────────────────────
const PhotoCarousel = () => {
  const images = CONFIG.fotosCarrusel;
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent(p => (p + 1) % images.length), [images.length]);
  const prev = () => setCurrent(p => (p - 1 + images.length) % images.length);
  useEffect(() => { const t = setInterval(next, 3800); return () => clearInterval(t); }, [next]);
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 800, margin: '0 auto', borderRadius: '1.8rem', overflow: 'hidden', aspectRatio: '4/3', boxShadow: '0 12px 40px rgba(139,69,82,0.18)' }}
      className="carousel-wrap">
      <div style={{ display: 'flex', height: '100%', transition: 'transform 0.9s cubic-bezier(.77,0,.175,1)', transform: `translateX(-${current * 100}%)` }}>
        {images.map((src, i) => (
          /* Cada slide tiene fondo borroso + foto encima centrada completa */
          <div key={i} style={{ width: '100%', height: '100%', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
            {/* Fondo borroso del mismo color/imagen */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(18px) brightness(0.85)', transform: 'scale(1.1)' }} />
            {/* Foto centrada, completa, sin recorte */}
            <img src={src} alt={`Foto ${i + 1}`} loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        ))}
      </div>
      {/* Nav buttons */}
      <button onClick={prev} className="carousel-btn carousel-btn-left" aria-label="Anterior">
        <ChevronLeft size={22} />
      </button>
      <button onClick={next} className="carousel-btn carousel-btn-right" aria-label="Siguiente">
        <ChevronRight size={22} />
      </button>
      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, background: 'rgba(30,15,15,0.3)', padding: '8px 18px', borderRadius: 9999, backdropFilter: 'blur(8px)' }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`Ir a foto ${i + 1}`}
            style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', background: i === current ? '#fff' : 'rgba(255,255,255,0.45)', transform: i === current ? 'scale(1.3)' : 'scale(1)', transition: 'all 0.3s' }} />
        ))}
      </div>
    </div>
  );
};

// Tipos MIME permitidos (solo imágenes, sin video)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB por foto

function isImageFile(file) {
  const type = (file.type || '').toLowerCase();
  return ALLOWED_IMAGE_TYPES.some((t) => type === t || type.startsWith('image/'));
}

// Miniatura con preview y botón quitar (revoca object URL al desmontar)
const PhotoPreviewThumb = ({ file, onRemove }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return (
    <div style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: 'rgba(252,228,236,0.4)', border: '1px solid rgba(243,182,194,0.5)' }}>
      {url && (
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Quitar foto"
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(139,69,82,0.9)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};

// ─── SUBIDA DE FOTOS AL ÁLBUM (Google Drive) ───────────────────────
const AlbumUploadForm = () => {
  const [nombre, setNombre] = useState('');
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => isImageFile(f) && f.size <= MAX_FILE_SIZE);
    setFiles((prev) => (prev.length ? [...prev, ...valid] : valid));
    setStatus('idle');
    setMessage('');
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setStatus('idle');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setStatus('error');
      setMessage('Elegí al menos una foto (solo imágenes, máx. 5 MB cada una).');
      return;
    }
    setStatus('loading');
    setMessage('');
    setProgress({ current: 0, total: files.length });
    const name = nombre.trim() || 'Invitado';
    const batchTime = Date.now();
    let ok = 0;
    let lastError = '';
    for (let i = 0; i < files.length; i++) {
      setProgress({ current: i + 1, total: files.length });
      const formData = new FormData();
      formData.append('nombre', name);
      formData.append('foto', files[i]);
      formData.append('batchTime', String(batchTime));
      formData.append('index', String(i + 1));
      try {
        const r = await fetch('/.netlify/functions/upload-photo', {
          method: 'POST',
          body: formData,
        });
        let data = {};
        try {
          data = await r.json();
        } catch (_) {}
        if (r.ok && data.ok) ok++;
        else {
          const msg = data.error || 'Error al subir';
          lastError = data.detail ? `${msg} (${data.detail})` : msg;
        }
      } catch {
        lastError = 'Error de conexión';
      }
    }
    setProgress({ current: 0, total: 0 });
    if (ok === files.length) {
      setStatus('success');
      setMessage(ok === 1 ? '¡Foto subida!' : `¡${ok} fotos subidas! Gracias por compartirlas.`);
      setFiles([]);
      e.target.reset();
    } else if (ok > 0) {
      setStatus('success');
      setMessage(`Se subieron ${ok} de ${files.length} fotos. ${lastError ? lastError : ''}`);
      setFiles([]);
      e.target.reset();
    } else {
      setStatus('error');
      setMessage(lastError || 'No se pudieron subir las fotos. Probá de nuevo.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
        <input
          name="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Tu nombre"
          className="form-input"
        />

        <div>
          <input
            ref={fileInputRef}
            id="album-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
            multiple
            onChange={handleFileChange}
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              border: 0,
              opacity: 0,
            }}
          />
          <label
            htmlFor="album-file-input"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '1rem 1.25rem',
              background: 'rgba(252,228,236,0.5)',
              border: '2px dashed rgba(243,182,194,0.7)',
              borderRadius: 16,
              cursor: 'pointer',
              color: '#8b4552',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(252,228,236,0.8)';
              e.currentTarget.style.borderColor = 'rgba(243,182,194,1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(252,228,236,0.5)';
              e.currentTarget.style.borderColor = 'rgba(243,182,194,0.7)';
            }}
          >
            <Images size={20} strokeWidth={1.8} />
            Elegir fotos
          </label>
          <p style={{ fontSize: '0.75rem', color: '#9d8585', marginTop: 6 }}>
            Solo imágenes · máx. 5 MB cada una
          </p>

          {files.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
                {files.map((file, i) => (
                  <PhotoPreviewThumb key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(i)} />
                ))}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 12,
                  padding: '0.5rem 1rem',
                  background: 'none',
                  border: '1px solid rgba(139,69,82,0.5)',
                  borderRadius: 9999,
                  color: '#8b4552',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <ImagePlus size={16} /> Agregar más fotos
              </button>
            </>
          )}
        </div>

        {status === 'loading' && progress.total > 0 && (
          <p style={{ color: '#8b4552', fontSize: '0.9rem' }}>
            Subiendo {progress.current} de {progress.total}…
          </p>
        )}
        {status === 'success' && <p style={{ color: '#16a34a', fontSize: '0.9rem' }}>{message}</p>}
        {status === 'error' && <p style={{ color: '#c53030', fontSize: '0.9rem' }}>{message}</p>}
        <button
          type="submit"
          className="btn-primary"
          disabled={status === 'loading' || files.length === 0}
          style={
            status === 'loading' || files.length === 0
              ? {
                  background: '#b0a09f',
                  color: '#fff',
                  cursor: 'not-allowed',
                  opacity: 0.9,
                  pointerEvents: 'none',
                }
              : undefined
          }
        >
          {status === 'loading' ? 'Subiendo…' : files.length === 0 ? 'Subir fotos' : files.length === 1 ? 'Subir 1 foto' : `Subir ${files.length} fotos`}
        </button>
      </form>
    </div>
  );
};

// ─── CUENTA REGRESIVA ─────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    const d = new Date(targetDate).getTime() - Date.now();
    if (d <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor((d % 86400000) / 3600000),
      minutes: Math.floor((d % 3600000) / 60000),
      seconds: Math.floor((d % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const i = setInterval(() => setT(calc()), 1000); return () => clearInterval(i); }, []);
  return t;
}

// Estado respecto a la fecha del casamiento: 'before' | 'wedding-day' | 'after'
function useWeddingDateState(targetDate) {
  const getState = useCallback(() => {
    const wd = new Date(targetDate);
    const today = new Date();
    const wdDay = new Date(wd.getFullYear(), wd.getMonth(), wd.getDate()).getTime();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    if (todayDay > wdDay) return 'after';
    if (todayDay === wdDay) return 'wedding-day';
    return 'before';
  }, [targetDate]);
  const [state, setState] = useState(getState);
  useEffect(() => {
    const i = setInterval(() => setState(getState()), 60000); // actualiza cada minuto
    return () => clearInterval(i);
  }, [getState]);
  return state;
}

// ─── MODAL BASE ───────────────────────────────────────────────────
const Modal = ({ onClose, title, subtitle, children }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(30,15,15,0.65)', backdropFilter: 'blur(10px)' }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="animate-fade-in-up" style={{ background: '#fffcfc', borderRadius: '2rem', padding: '2.2rem 2rem', maxWidth: 440, width: '100%', position: 'relative', boxShadow: '0 32px 80px rgba(139,69,82,0.22)', border: '1px solid #f3b6c2' }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#9d8585', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#8b4552'}
        onMouseLeave={e => e.currentTarget.style.color = '#9d8585'}>
        <X size={22} />
      </button>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', color: '#8b4552', marginBottom: 4 }}>{title}</h3>
      {subtitle && <p style={{ color: '#9d8585', fontSize: '0.88rem', marginBottom: '1.5rem' }}>{subtitle}</p>}
      {children}
    </div>
  </div>
);

// Envío a Netlify Forms (POST con form-name para que Netlify asocie el envío)
async function submitNetlifyForm(formName, fields) {
  const body = new URLSearchParams({ 'form-name': formName, ...fields });
  const r = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return r.ok;
}

// ─── MODAL MÚSICA ─────────────────────────────────────────────────
const MusicModal = ({ onClose }) => {
  const [status, setStatus] = useState('idle');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const form = e.target;
    const fields = {
      nombre: form.nombre?.value?.trim() || '',
      cancion: form.cancion?.value?.trim() || '',
      bot: form.bot?.value || '',
    };
    try {
      const ok = await submitNetlifyForm('musica', fields);
      setStatus(ok ? 'success' : 'error');
    } catch { setStatus('error'); }
  };
  if (status === 'success') return (
    <Modal onClose={onClose} title="¡Gracias! 🎶" subtitle="Tu canción fue enviada. ¡La ponemos en la lista!">
      <button onClick={onClose} className="btn-primary" style={{ marginTop: 8 }}>Cerrar</button>
    </Modal>
  );
  return (
    <Modal onClose={onClose} title="Sugerir Canción" subtitle="Ayudanos a armar la mejor playlist.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <input name="nombre" type="text" required placeholder="Tu nombre" className="form-input" />
        <input name="cancion" type="text" required placeholder="Canción y Artista (ej: Perfect — Ed Sheeran)" className="form-input" />
        <input name="bot" type="text" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />
        {status === 'error' && <p style={{ color: '#e05', fontSize: '0.82rem' }}>Hubo un error. Por favor intenta de nuevo.</p>}
        <button type="submit" className="btn-primary" style={{ marginTop: 4 }} disabled={status === 'loading'}>
          {status === 'loading' ? 'Enviando…' : 'Enviar sugerencia'}
        </button>
      </form>
    </Modal>
  );
};

// ─── MODAL RSVP ──────────────────────────────────────────────────
const RSVPModal = ({ onClose }) => {
  const [status, setStatus] = useState('idle');
  const [asiste, setAsiste] = useState('si');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const form = e.target;
    const fields = {
      nombre: form.nombre?.value?.trim() || '',
      asistencia: form.asistencia?.value || 'si',
      restricciones: form.restricciones?.value?.trim() || '',
      bot: form.bot?.value || '',
    };
    try {
      const ok = await submitNetlifyForm('rsvp', fields);
      if (ok) { setStatus('success'); if (asiste === 'si') lanzarConfetti(); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };
  if (status === 'success') return (
    <Modal onClose={onClose}
      title={asiste === 'si' ? '¡Nos vemos ahí! 💍' : 'La tenemos en cuenta 💌'}
      subtitle={asiste === 'si' ? 'Tu confirmación fue registrada. ¡Estamos muy emocionados!' : 'Gracias por avisarnos. ¡Te vamos a extrañar!'}>
      <button onClick={onClose} className="btn-primary" style={{ marginTop: 8 }}>Cerrar</button>
    </Modal>
  );
  return (
    <Modal onClose={onClose} title="Confirmar Asistencia" subtitle="Completá los datos para confirmar tu lugar.">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <input name="nombre" type="text" required placeholder="Nombre y Apellido" className="form-input" />
        <select name="asistencia" value={asiste} onChange={e => setAsiste(e.target.value)} className="form-input" style={{ cursor: 'pointer' }}>
          <option value="si">✅ Sí, ¡confirmo asistencia!</option>
          <option value="no">😔 Lamentablemente no podré ir</option>
        </select>
        {asiste === 'si' && (
          <input name="restricciones" type="text" placeholder="Restricciones alimentarias (opcional)" className="form-input" />
        )}
        <input name="bot" type="text" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />
        {status === 'error' && <p style={{ color: '#e05', fontSize: '0.82rem' }}>Hubo un error. Por favor intenta de nuevo.</p>}
        <button type="submit" className="btn-primary" style={{ marginTop: 4 }} disabled={status === 'loading'}>
          {status === 'loading' ? 'Enviando…' : 'Confirmar'}
        </button>
      </form>
    </Modal>
  );
};

// ─── BARRA DE SONIDO (animada) ────────────────────────────────────
const SoundBars = ({ playing }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 20 }}>
    {[1, 1.6, 0.8, 1.3, 0.6].map((h, i) => (
      <div key={i} style={{
        width: 3, borderRadius: 2, background: '#d48a98',
        height: playing ? `${h * 14}px` : '4px',
        animation: playing ? `soundBar ${0.6 + i * 0.15}s ease-in-out infinite alternate` : 'none',
        transition: 'height 0.4s ease',
      }} />
    ))}
  </div>
);

// ─── ÍCONO IGLESIA (SVG inline) ───────────────────────────────────
const ChurchIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4" /><path d="M10 4h4" />
    <path d="M12 6l-8 5v11h16V11l-8-5z" />
    <path d="M10 22v-6h4v6" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const audioRef = useRef(null);
  const countDown = useCountdown(CONFIG.fecha);
  const weddingState = useWeddingDateState(CONFIG.fecha); // 'before' | 'wedding-day' | 'after'
  const albumHabilitado = weddingState !== 'before';
  const esInvitacionFam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('inv') === 'fam';
  const mostrarCostosTarjeta = !esInvitacionFam && weddingState !== 'after';

  // Scroll listener para mini-nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Control de audio
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => { if (e.name !== 'AbortError') setIsPlaying(false); });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, hasEntered]);

  const enter = () => { setHasEntered(true); setIsPlaying(true); window.scrollTo(0, 0); };

  // ── PORTADA ───────────────────────────────────────────────────
  if (!hasEntered) {
    return (
      <div style={{ minHeight: '100svh', background: '#fffcfc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Fondo blur */}
        <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${CONFIG.imagenFondo})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.18, zIndex: 0 }} />
        <FallingPetals />
        {/* Tarjeta portada */}
        <div className="animate-cover" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460 }}>
          <div style={{ borderRadius: '3rem', overflow: 'hidden', boxShadow: '0 24px 80px rgba(139,69,82,0.18)', border: '1px solid rgba(243,182,194,0.4)', backgroundImage: `url(${CONFIG.imagenPortada})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Capa blanca semitransparente — permite ver la imagen de fondo */}
            <div style={{ background: 'rgba(255,252,252,0.52)' }}>
              <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#c4788a', fontWeight: 600, marginBottom: '1.8rem', display: 'block' }}>Nuestra Boda</span>

                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3.2rem,12vw,5.5rem)', color: '#8b4552', lineHeight: 1.1, marginBottom: '1rem' }}>
                  {CONFIG.novios.ella}
                  <span style={{ display: 'block', fontStyle: 'italic', color: '#d48a98', fontSize: '0.55em', fontWeight: 300, margin: '0.3rem 0' }}>&</span>
                  {CONFIG.novios.el}
                </h1>

                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: '#78706c', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '2rem', fontWeight: 500 }}>25 · 07 · 2026</p>

                {/* Decorador */}
                <div style={{ width: 60, height: 1, background: 'linear-gradient(to right,transparent,#e8b4bc,transparent)', margin: '0 auto 1.8rem' }} />

                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#5a4242', fontStyle: 'italic', lineHeight: 1.75, marginBottom: '2.2rem', maxWidth: 340 }}>
                  "Y sin darnos cuenta, un hilo invisible comenzó a unir nuestras historias…
                  <br /><br />
                  <strong style={{ color: '#8b4552', fontStyle: 'normal' }}>Hoy celebramos el momento en que esos caminos se convierten en uno.</strong>"
                </p>

                <button onClick={enter} className="btn-primary">
                  <Heart size={16} strokeWidth={2} /> Abrir invitación
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── INVITACIÓN PRINCIPAL ──────────────────────────────────────
  return (
    <div style={{ minHeight: '100svh', background: '#fffcfc', position: 'relative', paddingBottom: '5rem', overflowX: 'hidden' }}>

      {/* Fondo fixed */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${CONFIG.imagenFondo})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', opacity: 0.12, zIndex: 0, pointerEvents: 'none' }} />
      <FallingPetals />

      {/* Audio */}
      <audio ref={audioRef} loop preload="auto">
        <source src={CONFIG.audioURL} type="audio/mpeg" />
      </audio>

      {/* ── Mini-nav sticky ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, transition: 'all 0.5s', background: scrolled ? 'rgba(255,252,252,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(14px)' : 'none', borderBottom: scrolled ? '1px solid rgba(243,182,194,0.35)' : 'none', boxShadow: scrolled ? '0 2px 20px rgba(139,69,82,0.08)' : 'none' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-serif)', color: '#8b4552', fontSize: '1.1rem', opacity: scrolled ? 1 : 0, transition: 'opacity 0.5s' }}>
            {CONFIG.novios.ella} & {CONFIG.novios.el}
          </span>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            {[['#eventos','Eventos'],['#regalos','Regalos'],['#historia','Historia']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontFamily: 'var(--font-sans)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8b4552', textDecoration: 'none', opacity: scrolled ? 1 : 0, transition: 'opacity 0.5s', fontWeight: 600 }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Botón música flotante ── */}
      <button onClick={() => setIsPlaying(p => !p)} aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 52, height: 52, background: 'rgba(255,252,252,0.95)', backdropFilter: 'blur(12px)', borderRadius: '50%', border: '1px solid #f3b6c2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(139,69,82,0.15)', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        {isPlaying ? <SoundBars playing /> : <VolumeX size={20} color="#c4788a" />}
      </button>

      {/* ── CONTENIDO ── */}
      <main style={{ position: 'relative', zIndex: 10, maxWidth: 860, margin: '0 auto', padding: '6rem 1.2rem 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* 1 · HEADER + CUENTA REGRESIVA o CARTELES */}
        <RevealOnScroll>
          <section className="card" style={{ textAlign: 'center' }}>
            <div className="animate-float-slow" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
              <Heart size={34} strokeWidth={1.4} color="#e8b4bc" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(3rem,10vw,5.5rem)', color: '#8b4552', lineHeight: 1.1, letterSpacing: '0.03em', marginBottom: '0.75rem' }}>
              {CONFIG.novios.ella} <span style={{ color: '#e8b4bc', fontWeight: 300 }}>&</span> {CONFIG.novios.el}
            </h1>
            <p style={{ fontFamily: 'var(--font-sans)', color: '#a08080', letterSpacing: '0.3em', textTransform: 'uppercase', fontSize: '0.78rem', marginBottom: '2.5rem', fontWeight: 500 }}>{CONFIG.fechaLegible}</p>

            {weddingState === 'after' && (
              <div style={{ borderTop: '1px solid rgba(243,182,194,0.4)', paddingTop: '2rem' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,4vw,1.9rem)', color: '#8b4552', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  Gracias por haber estado con nosotros
                </p>
                <p style={{ color: '#6b5b5b', maxWidth: 480, margin: '0 auto', lineHeight: 1.8, fontSize: '1rem' }}>
                  Esperamos que hayan pasado un día hermoso y que lo hayan disfrutado tanto como nosotros. Ya comenzamos nuestra vida juntos y los llevamos en el corazón. 💕
                </p>
              </div>
            )}

            {weddingState === 'wedding-day' && (
              <div style={{ borderTop: '1px solid rgba(243,182,194,0.4)', paddingTop: '2rem' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', color: '#c4788a', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                  ¡Hoy nos casamos! 💍
                </p>
                <p style={{ color: '#8b4552', fontSize: '1.05rem', fontStyle: 'italic' }}>
                  Este es nuestro día y estamos felices de compartirlo con ustedes.
                </p>
              </div>
            )}

            {weddingState === 'before' && (
              <div style={{ borderTop: '1px solid rgba(243,182,194,0.4)', paddingTop: '2rem', display: 'flex', justifyContent: 'center', gap: 'clamp(1rem,4vw,2.5rem)', flexWrap: 'wrap' }}>
                {[['Días',countDown.days],['Horas',countDown.hours],['Minutos',countDown.minutes],['Segundos',countDown.seconds]].map(([l,v]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ width: 'clamp(60px,15vw,84px)', height: 'clamp(60px,15vw,84px)', background: 'rgba(252,228,236,0.5)', borderRadius: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(243,182,194,0.4)', marginBottom: 8, boxShadow: 'inset 0 2px 8px rgba(139,69,82,0.06)' }}>
                      <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,4vw,2rem)', color: '#8b4552', fontWeight: 500 }}>{String(v).padStart(2,'0')}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b09090', fontWeight: 600 }}>{l}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </RevealOnScroll>

        {/* 2 · CUÁNDO Y DÓNDE */}
        <RevealOnScroll delay={50} >
          <section id="eventos" className="card">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', color: '#8b4552', textAlign: 'center', marginBottom: '2.5rem' }}>Cuándo y Dónde</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '2.5rem' }}>
              {/* Ceremonia */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 76, height: 76, background: 'rgba(252,228,236,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(243,182,194,0.5)', marginBottom: '1.2rem', color: '#c4788a' }} className="animate-swing">
                  <ChurchIcon />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#8b4552', marginBottom: '0.75rem' }}>Ceremonia</h3>
                <p style={{ color: '#6b5b5b', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Celebramos nuestra unión a las <strong>21:00 hs</strong> en <em style={{ color: '#8b4552' }}>{CONFIG.lugar}</em>.
                </p>
                <a href={CONFIG.ubicacionURL} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                  <MapPin size={15} /> Ver ubicación
                </a>
              </div>
              {/* Separador vertical */}
              <div style={{ width: 1, background: 'rgba(243,182,194,0.4)', alignSelf: 'stretch', display: 'none' }} className="vdivider" />
              {/* Fiesta */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 76, height: 76, background: 'rgba(252,228,236,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(243,182,194,0.5)', marginBottom: '1.2rem', color: '#c4788a', gap: 2 }}>
                  <svg className="animate-clink-left" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 22h8"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5V4H7v6a5 5 0 0 0 5 5z"/><path d="M7 10h10"/>
                  </svg>
                  <svg className="animate-clink-right" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 22h8"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5V4H7v6a5 5 0 0 0 5 5z"/><path d="M7 10h10"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#8b4552', marginBottom: '0.75rem' }}>Recepción y Fiesta</h3>
                <p style={{ color: '#6b5b5b', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Luego de la ceremonia, celebramos juntos hasta las <strong>{CONFIG.horaFin}</strong>.
                </p>
                <button onClick={descargarICS} className="btn-outline" style={{ marginTop: 'auto' }}>
                  <CalendarHeart size={15} /> Agendar evento
                </button>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* 3 · RESERVA DE LUGAR (costos) — oculta si ?inv=fam o si ya pasó la fecha */}
        {mostrarCostosTarjeta && (
          <RevealOnScroll delay={50}>
            <section style={{ background: 'linear-gradient(135deg,rgba(252,228,236,0.9) 0%,rgba(255,240,245,0.95) 100%)', backdropFilter: 'blur(20px)', borderRadius: '2.5rem', border: '1px solid rgba(243,182,194,0.5)', boxShadow: '0 8px 40px rgba(139,69,82,0.08)', padding: '3rem', textAlign: 'center' }}>
              <div className="animate-float-slow" style={{ display: 'inline-block', marginBottom: '1.2rem' }}>
                <CalendarHeart size={48} strokeWidth={1.4} color="#8b4552" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', color: '#8b4552', marginBottom: '0.9rem' }}>Reserva de Lugar</h2>
              <p style={{ color: '#6b5b5b', marginBottom: '2.2rem', maxWidth: 520, margin: '0 auto 2.2rem', lineHeight: 1.75, fontSize: '0.95rem' }}>
                La participación se realiza mediante reserva de tarjeta. El valor por persona:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                {[
                  { label: 'Hasta el 15/04', price: '$65.000', featured: true },
                  { label: 'Hasta el 15/06', price: '$70.000', featured: false },
                  { label: 'Día del evento', price: '$75.000', featured: false },
                ].map((item, i) => (
                  <div key={i} style={{ flex: '1 1 140px', maxWidth: 190, background: '#fff', borderRadius: '1.5rem', padding: '1.4rem 1rem', border: item.featured ? '2px solid #e8b4bc' : '1px solid rgba(243,182,194,0.45)', boxShadow: item.featured ? '0 8px 28px rgba(139,69,82,0.14)' : '0 2px 10px rgba(139,69,82,0.06)', transform: item.featured ? 'scale(1.04)' : 'none', position: 'relative' }}>
                    {item.featured && <span style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: '#8b4552', color: '#fff', fontSize: '0.6rem', padding: '3px 12px', borderRadius: 9999, fontFamily: 'var(--font-sans)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>Precio actual</span>}
                    <span style={{ display: 'block', fontSize: '0.65rem', color: '#a09090', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.6rem', fontFamily: 'var(--font-sans)' }}>{item.label}</span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: item.featured ? '#c4788a' : '#8b4552', fontWeight: 500 }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </section>
          </RevealOnScroll>
        )}

        {/* 4 · INFO IMPORTANTE */}
        <RevealOnScroll delay={50}>
          <section className="card">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', color: '#8b4552', textAlign: 'center', marginBottom: '2.5rem' }}>Información Importante</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '2.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: 'rgba(252,228,236,0.6)', border: '1px solid rgba(243,182,194,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#c4788a' }}>
                  <Shirt size={28} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#8b4552', marginBottom: '0.75rem' }}>Código de Vestimenta</h3>
                <p style={{ color: '#6b5b5b', lineHeight: 1.8, fontSize: '0.93rem' }}>
                  Sugerimos vestimenta formal / elegante.<br /><br />
                  Les pedimos reservar el color blanco para la novia y en lo posible evitar el rosa, que formará parte de la identidad visual de la celebración.
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: 'rgba(252,228,236,0.6)', border: '1px solid rgba(243,182,194,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#c4788a' }}>
                  <UsersRound size={28} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#8b4552', marginBottom: '0.75rem' }}>Celebración solo para Adultos</h3>
                <p style={{ color: '#6b5b5b', lineHeight: 1.8, fontSize: '0.93rem' }}>
                  Amamos a sus pequeños, pero por razones de organización y seguridad, en esta oportunidad el evento será para mayores de edad.<br /><br />
                  Agradecemos profundamente su comprensión y el esfuerzo que implica acompañarnos.
                </p>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* 5 · MÚSICA — sugerir canción */}
        <RevealOnScroll delay={50}>
          <section style={{ background: 'linear-gradient(135deg,#8b4552 0%,#6e3741 100%)', borderRadius: '2.5rem', padding: '3rem', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 16px 60px rgba(139,69,82,0.35)' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 280, height: 280, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', transform: 'translate(30%,-30%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', transform: 'translate(-30%,30%)' }} />
            <div className="animate-float-music" style={{ display: 'inline-block', position: 'relative', zIndex: 1 }}>
              <Music2 size={56} strokeWidth={1.3} color="rgba(252,228,236,0.9)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', color: '#fff', marginBottom: '0.9rem', position: 'relative', zIndex: 1 }}>La pista es de todos</h2>
            <p style={{ color: 'rgba(252,228,236,0.8)', marginBottom: '2rem', maxWidth: 420, margin: '0 auto 2rem', lineHeight: 1.75, position: 'relative', zIndex: 1, fontSize: '0.97rem' }}>
              ¿Qué canción no puede faltar para que bailemos todos?
            </p>
            <button onClick={() => setShowMusic(true)} style={{ position: 'relative', zIndex: 1, padding: '0.9rem 2.5rem', background: '#fff', color: '#8b4552', border: 'none', borderRadius: 9999, fontFamily: 'var(--font-sans)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,0.2)', transition: 'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(0,0,0,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.2)'; }}>
              🎵 Sugerir canción
            </button>
          </section>
        </RevealOnScroll>

        {/* 6 · ACOMPÁÑANOS: Asistencia (solo antes/el día) + Regalos */}
        <RevealOnScroll delay={50}>
          <section id="regalos" className="card">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', color: '#8b4552', textAlign: 'center', marginBottom: '2.5rem' }}>
              {weddingState === 'after' ? 'Regalos' : 'Acompáñanos'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: weddingState === 'after' ? '1fr' : 'repeat(auto-fit,minmax(220px,1fr))', gap: '2.5rem' }}>
              {/* Asistencia — solo antes o el día del casamiento */}
              {weddingState !== 'after' && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="animate-heartbeat" style={{ marginBottom: '1.2rem' }}>
                    <CheckCircle size={52} strokeWidth={1.2} color="#c4788a" />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#8b4552', marginBottom: '0.75rem' }}>Asistencia</h3>
                  <p style={{ color: '#6b5b5b', lineHeight: 1.8, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Confirmá tu asistencia para ayudarnos con la organización.
                  </p>
                  <button onClick={() => setShowRSVP(true)} className="btn-primary" style={{ marginTop: 'auto' }}>
                    Confirmar asistencia
                  </button>
                </div>
              )}
              {/* Regalos */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="animate-wiggle" style={{ marginBottom: '1.2rem' }}>
                  <Gift size={52} strokeWidth={1.2} color="#c4788a" />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#8b4552', marginBottom: '0.75rem' }}>Regalos</h3>
                <p style={{ color: '#6b5b5b', lineHeight: 1.75, marginBottom: '1.2rem', fontSize: '0.93rem' }}>
                  El mayor regalo es tu presencia. Si querés hacernos un presente, podés contribuir con nuestra luna de miel.
                </p>
                <div style={{ background: 'rgba(252,228,236,0.4)', width: '100%', padding: '1.2rem 1.4rem', borderRadius: '1.2rem', border: '1px solid rgba(243,182,194,0.5)', textAlign: 'left', marginTop: 'auto' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', color: '#8b4552', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.8rem' }}>Datos Bancarios</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.6rem', marginBottom: '0.6rem', borderBottom: '1px solid rgba(243,182,194,0.4)' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9d8585' }}>Alias</span>
                    <CopyAlias alias={CONFIG.alias} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#9d8585' }}>Titular</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{CONFIG.titular}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* 7 · HISTORIA */}
        <RevealOnScroll delay={50}>
          <section id="historia" className="card">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', color: '#8b4552', textAlign: 'center', marginBottom: '2rem' }}>Nuestra Historia</h2>
            <PhotoCarousel />
          </section>
        </RevealOnScroll>

        {/* 8 · ÁLBUM DE FOTOS (subida a Google Drive) */}
        <RevealOnScroll delay={50}>
          <section id="album-fotos" className="card" style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: 'rgba(252,228,236,0.6)', border: '1px solid rgba(243,182,194,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', color: '#c4788a' }}>
              <Images size={28} strokeWidth={1.5} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,5vw,2.6rem)', color: '#8b4552', marginBottom: '0.9rem' }}>Sumá tus fotos al álbum</h2>

            {!albumHabilitado ? (
              <div style={{ maxWidth: 520, margin: '0 auto', padding: '1.5rem 1.5rem', background: 'rgba(252,228,236,0.4)', borderRadius: '1.2rem', border: '1px solid rgba(243,182,194,0.5)', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#8b4552', marginBottom: '0.75rem' }}>
                  Próximamente podrás subir tus fotos
                </h3>
                <p style={{ color: '#6b5b5b', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '0.75rem' }}>
                  Cuando llegue el día de nuestra boda, desde acá vas a poder subir las fotos que quieras compartir con nosotros. Las guardaremos con mucho cariño en nuestro álbum.
                </p>
                <p style={{ color: '#9d8585', fontSize: '0.88rem', fontWeight: 500 }}>
                  ¡Quedate atento/a que falta poquito!
                </p>
              </div>
            ) : (
              <>
                <p style={{ color: '#6b5b5b', maxWidth: 520, margin: '0 auto 1.5rem', lineHeight: 1.75, fontSize: '0.95rem' }}>
                  ¿Tenés fotos de {CONFIG.novios.ella} y {CONFIG.novios.el} que quieras compartir? Subilas acá y se guardarán en nuestro álbum de Google Drive.
                </p>
                <AlbumUploadForm />
              </>
            )}
          </section>
        </RevealOnScroll>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ textAlign: 'center', padding: '3rem 1rem 2rem', position: 'relative', zIndex: 10 }}>
        <div className="animate-heartbeat" style={{ display: 'inline-block', marginBottom: '1.2rem' }}>
          <Heart size={30} strokeWidth={1.5} color="#8b4552" fill="rgba(139,69,82,0.15)" />
        </div>
        {weddingState === 'after' ? (
          <>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,6vw,3rem)', color: '#8b4552', marginBottom: '0.5rem' }}>Gracias por compartir con nosotros</h2>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: '#6b5b5b', maxWidth: 420, margin: '0 auto 1rem', lineHeight: 1.7 }}>
              Cada momento vivido junto a ustedes quedó guardado en nuestro corazón.
            </p>
          </>
        ) : (
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,6vw,3rem)', color: '#8b4552', marginBottom: '0.5rem' }}>¡Los esperamos!</h2>
        )}
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#a09090', marginBottom: '2rem', fontWeight: 600 }}>
          {CONFIG.novios.ella} & {CONFIG.novios.el} · 25.07.2026
        </p>
        <ShareWhatsApp />
      </footer>

      {/* ── MODALES ── */}
      {showRSVP && <RSVPModal onClose={() => setShowRSVP(false)} />}
      {showMusic && <MusicModal onClose={() => setShowMusic(false)} />}

      {/* ── ESTILOS ADICIONALES ── */}
      <style>{`
        @keyframes soundBar {
          0%   { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
        .carousel-btn {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,252,252,0.5); border: none; cursor: pointer;
          color: #8b4552; padding: 0.6rem; border-radius: 50%;
          backdrop-filter: blur(8px); transition: background 0.2s, opacity 0.3s;
          opacity: 0;
        }
        .carousel-wrap:hover .carousel-btn { opacity: 1; }
        .carousel-btn:hover { background: rgba(255,252,252,0.9); }
        .carousel-btn-left  { left: 14px; }
        .carousel-btn-right { right: 14px; }
        @media (max-width: 640px) {
          .carousel-btn { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
