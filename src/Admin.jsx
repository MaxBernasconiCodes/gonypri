import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Music2, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'gonypri_admin_token';

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function Admin() {
  const [token, setTokenState] = useState(() =>
    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(STORAGE_KEY) : null
  );
  const [inputPassword, setInputPassword] = useState('');
  const [rsvp, setRsvp] = useState([]);
  const [musica, setMusica] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setToken = useCallback((t) => {
    if (t) sessionStorage.setItem(STORAGE_KEY, t);
    else sessionStorage.removeItem(STORAGE_KEY);
    setTokenState(t);
  }, []);

  const fetchSubmissions = useCallback(async (authToken) => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/.netlify/functions/get-form-submissions', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || 'Error al cargar');
        return;
      }
      setRsvp(data.rsvp || []);
      setMusica(data.musica || []);
    } catch (e) {
      setError(e.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchSubmissions(token);
  }, [token, fetchSubmissions]);

  const handleLogin = (e) => {
    e.preventDefault();
    const t = inputPassword.trim();
    if (!t) return;
    setToken(t);
    setInputPassword('');
    fetchSubmissions(t);
  };

  const handleLogout = () => {
    setToken(null);
    setRsvp([]);
    setMusica([]);
    setError(null);
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
    background: '#fff',
    borderRadius: '1rem',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(139,69,82,0.08)',
  };
  const thStyle = {
    textAlign: 'left',
    padding: '0.85rem 1rem',
    background: 'rgba(252,228,236,0.6)',
    color: '#8b4552',
    fontFamily: 'var(--font-sans)',
    fontWeight: 600,
    borderBottom: '1px solid rgba(243,182,194,0.5)',
  };
  const tdStyle = {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(243,182,194,0.25)',
    color: '#5a4242',
  };

  // Pantalla de login
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fffcfc 0%, #fef5f7 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '2rem',
          padding: '2.5rem',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 16px 48px rgba(139,69,82,0.12)',
          border: '1px solid rgba(243,182,194,0.4)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            color: '#8b4552',
            marginBottom: '0.5rem',
            textAlign: 'center',
          }}>
            Administración
          </h1>
          <p style={{
            fontSize: '0.9rem',
            color: '#9d8585',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            Ingresá la clave para ver las respuestas
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="Clave de administración"
              className="form-input"
              autoFocus
            />
            {error && (
              <p style={{ color: '#c53030', fontSize: '0.85rem' }}>{error}</p>
            )}
            <button type="submit" className="btn-primary">
              Entrar
            </button>
          </form>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: '1.5rem',
              fontSize: '0.85rem',
              color: '#8b4552',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <ArrowLeft size={16} /> Volver a la invitación
          </a>
        </div>
      </div>
    );
  }

  // Pantalla de respuestas
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffcfc 0%, #fef5f7 100%)',
      padding: '2rem 1rem 4rem',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            color: '#8b4552',
            margin: 0,
          }}>
            Respuestas de la invitación
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.85rem',
                color: '#8b4552',
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
            >
              <ArrowLeft size={16} /> Invitación
            </a>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.5rem 1rem',
                background: 'none',
                border: '1px solid rgba(139,69,82,0.4)',
                borderRadius: 9999,
                color: '#8b4552',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} /> Salir
            </button>
          </div>
        </header>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#8b4552' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '0.5rem' }}>Cargando respuestas…</p>
          </div>
        )}

        {error && (
          <p style={{
            padding: '1rem',
            background: '#fef2f2',
            color: '#c53030',
            borderRadius: '1rem',
            marginBottom: '1.5rem',
          }}>
            {error}
          </p>
        )}

        {!loading && (
          <>
            <section style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.35rem',
                color: '#8b4552',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <CheckCircle size={22} /> Confirmaciones de asistencia ({rsvp.length})
              </h2>
              <div style={{ overflowX: 'auto' }}>
                {rsvp.length === 0 ? (
                  <p style={{ color: '#9d8585', fontStyle: 'italic' }}>Aún no hay respuestas.</p>
                ) : (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Nombre</th>
                        <th style={thStyle}>Asistencia</th>
                        <th style={thStyle}>Restricciones</th>
                        <th style={thStyle}>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rsvp.map((s) => (
                        <tr key={s.id}>
                          <td style={tdStyle}>{s.data?.nombre ?? '—'}</td>
                          <td style={tdStyle}>{s.data?.asistencia === 'si' ? '✅ Sí' : '❌ No'}</td>
                          <td style={tdStyle}>{s.data?.restricciones || '—'}</td>
                          <td style={tdStyle}>{formatDate(s.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.35rem',
                color: '#8b4552',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <Music2 size={22} /> Sugerencias de canciones ({musica.length})
              </h2>
              <div style={{ overflowX: 'auto' }}>
                {musica.length === 0 ? (
                  <p style={{ color: '#9d8585', fontStyle: 'italic' }}>Aún no hay sugerencias.</p>
                ) : (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Nombre</th>
                        <th style={thStyle}>Canción</th>
                        <th style={thStyle}>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {musica.map((s) => (
                        <tr key={s.id}>
                          <td style={tdStyle}>{s.data?.nombre ?? '—'}</td>
                          <td style={tdStyle}>{s.data?.cancion ?? '—'}</td>
                          <td style={tdStyle}>{formatDate(s.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
