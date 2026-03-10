import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Music2, CheckCircle, Loader2, ArrowLeft, Archive, ArchiveRestore, Trash2, Search, ChevronUp, ChevronDown, FileSpreadsheet } from 'lucide-react';

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

function formatDateForExport(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

function escapeCsvCell(str) {
  if (str == null) return '';
  const s = String(str);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function exportRsvpToCsv(list) {
  const sep = ';';
  const headers = ['Nombre', 'Asistencia', 'Restricciones alimentarias', 'Fecha de respuesta', 'Archivada'];
  const rows = list.map((s) => [
    escapeCsvCell(s.data?.nombre ?? ''),
    s.data?.asistencia === 'si' ? 'Sí' : 'No',
    escapeCsvCell(s.data?.restricciones ?? ''),
    formatDateForExport(s.created_at),
    s.spam === true || s.state === 'spam' ? 'Sí' : 'No',
  ]);
  const csv = [headers.join(sep), ...rows.map((r) => r.join(sep))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invitados-rsvp-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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
  const [actionLoading, setActionLoading] = useState(null); // 'rsvp-123' | 'musica-456'
  const [includeArchived, setIncludeArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortRsvp, setSortRsvp] = useState({ column: null, dir: 'asc' });
  const [sortMusica, setSortMusica] = useState({ column: null, dir: 'asc' });

  const setToken = useCallback((t) => {
    if (t) sessionStorage.setItem(STORAGE_KEY, t);
    else sessionStorage.removeItem(STORAGE_KEY);
    setTokenState(t);
  }, []);

  const fetchSubmissions = useCallback(async (authToken, includeArchivedParam) => {
    setLoading(true);
    setError(null);
    try {
      const url = includeArchivedParam
        ? '/.netlify/functions/get-form-submissions?include_archived=1'
        : '/.netlify/functions/get-form-submissions';
      const r = await fetch(url, {
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

  const runAction = useCallback(async (formName, submissionId, action) => {
    const key = `${formName}-${submissionId}`;
    setActionLoading(key);
    setError(null);
    try {
      const r = await fetch('/.netlify/functions/form-submission-action', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, formName, submissionId }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || 'Error al ejecutar la acción');
        return;
      }
      await fetchSubmissions(token, includeArchived);
    } catch (e) {
      setError(e.message || 'Error de conexión');
    } finally {
      setActionLoading(null);
    }
  }, [token, includeArchived, fetchSubmissions]);

  const handleDelete = useCallback((formName, submissionId, label) => {
    if (!window.confirm(`¿Eliminar de forma permanente "${label}"? Esta acción no se puede deshacer.`)) return;
    runAction(formName, submissionId, 'delete');
  }, [runAction]);

  useEffect(() => {
    if (token) fetchSubmissions(token, includeArchived);
  }, [token, includeArchived, fetchSubmissions]);

  const handleLogin = (e) => {
    e.preventDefault();
    const t = inputPassword.trim();
    if (!t) return;
    setToken(t);
    setInputPassword('');
    fetchSubmissions(t, includeArchived);
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
  const btnIconStyle = {
    padding: '0.4rem',
    background: 'rgba(252,228,236,0.5)',
    border: '1px solid rgba(243,182,194,0.5)',
    borderRadius: 8,
    color: '#8b4552',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Búsqueda por nombre (incluye texto, no coincidencia exacta)
  const q = searchQuery.trim().toLowerCase();
  const filterByName = (list, getName) =>
    q ? list.filter((s) => (getName(s) ?? '').toLowerCase().includes(q)) : list;

  const filteredRsvp = filterByName(rsvp, (s) => s.data?.nombre);
  const filteredMusica = filterByName(musica, (s) => s.data?.nombre);

  // Ordenar
  const sortList = (list, column, dir, getValue) => {
    if (!column || !list.length) return list;
    const mult = dir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'string' && typeof vb === 'string') return mult * (va.localeCompare(vb, 'es') || 0);
      if (va instanceof Date && vb instanceof Date) return mult * (va.getTime() - vb.getTime());
      if (typeof va === 'number' && typeof vb === 'number') return mult * (va - vb);
      return mult * String(va).localeCompare(String(vb), 'es');
    });
  };

  const getRsvpValue = (s, col) => {
    if (col === 'nombre') return s.data?.nombre ?? '';
    if (col === 'asistencia') return s.data?.asistencia === 'si' ? 'Sí' : 'No';
    if (col === 'restricciones') return s.data?.restricciones ?? '';
    if (col === 'fecha') return s.created_at ? new Date(s.created_at).getTime() : 0;
    return '';
  };
  const getMusicaValue = (s, col) => {
    if (col === 'nombre') return s.data?.nombre ?? '';
    if (col === 'cancion') return s.data?.cancion ?? '';
    if (col === 'fecha') return s.created_at ? new Date(s.created_at).getTime() : 0;
    return '';
  };

  const sortedRsvp = sortList(
    filteredRsvp,
    sortRsvp.column,
    sortRsvp.dir,
    (s) => getRsvpValue(s, sortRsvp.column)
  );
  const sortedMusica = sortList(
    filteredMusica,
    sortMusica.column,
    sortMusica.dir,
    (s) => getMusicaValue(s, sortMusica.column)
  );

  const handleSortRsvp = (column) => {
    setSortRsvp((prev) => ({
      column,
      dir: prev.column === column && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };
  const handleSortMusica = (column) => {
    setSortMusica((prev) => ({
      column,
      dir: prev.column === column && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const thSortableStyle = { ...thStyle, cursor: 'pointer', userSelect: 'none' };
  const SortIcon = ({ column, currentColumn, dir }) =>
    currentColumn === column ? (dir === 'asc' ? <ChevronUp size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} /> : <ChevronDown size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />) : null;
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

        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', color: '#5a4242' }}>
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
            />
            Incluir archivadas
          </label>
          <span style={{ fontSize: '0.8rem', color: '#9d8585' }}>
            Archivar no borra: oculta la respuesta y podés restaurarla después.
          </span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#5a4242', marginBottom: 6, fontFamily: 'var(--font-sans)' }}>
            Buscar por nombre
          </label>
          <div style={{ position: 'relative', maxWidth: 320 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9d8585' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Texto incluido en el nombre..."
              className="form-input"
              style={{ paddingLeft: 40 }}
            />
          </div>
          {q && (
            <p style={{ fontSize: '0.8rem', color: '#8b4552', marginTop: 6 }}>
              Mostrando {sortedRsvp.length} de {rsvp.length} asistencias, {sortedMusica.length} de {musica.length} canciones
            </p>
          )}
        </div>

        {!loading && (
          <>
            <section style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.35rem',
                  color: '#8b4552',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <CheckCircle size={22} /> Confirmaciones de asistencia ({sortedRsvp.length}{rsvp.length !== sortedRsvp.length ? ` de ${rsvp.length}` : ''})
                </h2>
                <button
                  type="button"
                  onClick={() => exportRsvpToCsv(sortedRsvp)}
                  disabled={sortedRsvp.length === 0}
                  title="Descarga el listado actual (con el filtro y orden aplicados) en CSV para abrir en Excel"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '0.5rem 1rem',
                    background: sortedRsvp.length === 0 ? '#e8e4e4' : 'rgba(252,228,236,0.8)',
                    border: `1px solid ${sortedRsvp.length === 0 ? '#ccc' : 'rgba(243,182,194,0.7)'}`,
                    borderRadius: 10,
                    color: sortedRsvp.length === 0 ? '#9d8585' : '#8b4552',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: sortedRsvp.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <FileSpreadsheet size={18} /> Exportar a Excel
                </button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                {sortedRsvp.length === 0 ? (
                  <p style={{ color: '#9d8585', fontStyle: 'italic' }}>{q ? 'Ningún nombre coincide con la búsqueda.' : 'Aún no hay respuestas.'}</p>
                ) : (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thSortableStyle} onClick={() => handleSortRsvp('nombre')}>Nombre <SortIcon column="nombre" currentColumn={sortRsvp.column} dir={sortRsvp.dir} /></th>
                        <th style={thSortableStyle} onClick={() => handleSortRsvp('asistencia')}>Asistencia <SortIcon column="asistencia" currentColumn={sortRsvp.column} dir={sortRsvp.dir} /></th>
                        <th style={thSortableStyle} onClick={() => handleSortRsvp('restricciones')}>Restricciones <SortIcon column="restricciones" currentColumn={sortRsvp.column} dir={sortRsvp.dir} /></th>
                        <th style={thSortableStyle} onClick={() => handleSortRsvp('fecha')}>Fecha <SortIcon column="fecha" currentColumn={sortRsvp.column} dir={sortRsvp.dir} /></th>
                        <th style={{ ...thStyle, width: 140 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRsvp.map((s) => {
                        const key = `rsvp-${s.id}`;
                        const loadingRow = actionLoading === key;
                        const isArchived = s.spam === true || s.state === 'spam';
                        const label = s.data?.nombre ?? 'esta respuesta';
                        return (
                          <tr key={s.id} style={isArchived ? { background: 'rgba(0,0,0,0.04)' } : undefined}>
                            <td style={tdStyle}>
                              {s.data?.nombre ?? '—'}
                              {isArchived && (
                                <span style={{ marginLeft: 8, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b4552', background: 'rgba(139,69,82,0.12)', padding: '2px 8px', borderRadius: 6 }}>Archivada</span>
                              )}
                            </td>
                            <td style={tdStyle}>{s.data?.asistencia === 'si' ? '✅ Sí' : '❌ No'}</td>
                            <td style={tdStyle}>{s.data?.restricciones || '—'}</td>
                            <td style={tdStyle}>{formatDate(s.created_at)}</td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {isArchived ? (
                                  <button
                                    type="button"
                                    onClick={() => runAction('rsvp', s.id, 'restore')}
                                    disabled={loadingRow}
                                    title="Desarchivar (restaurar a la lista principal)"
                                    style={btnIconStyle}
                                  >
                                    {loadingRow ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ArchiveRestore size={14} />}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => runAction('rsvp', s.id, 'archive')}
                                    disabled={loadingRow}
                                    title="Archivar (ocultar sin borrar)"
                                    style={btnIconStyle}
                                  >
                                    {loadingRow ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Archive size={14} />}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDelete('rsvp', s.id, label)}
                                  disabled={loadingRow}
                                  title="Eliminar de forma permanente"
                                  style={{ ...btnIconStyle, color: '#c53030' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
                <Music2 size={22} /> Sugerencias de canciones ({sortedMusica.length}{musica.length !== sortedMusica.length ? ` de ${musica.length}` : ''})
              </h2>
              <div style={{ overflowX: 'auto' }}>
                {sortedMusica.length === 0 ? (
                  <p style={{ color: '#9d8585', fontStyle: 'italic' }}>{q ? 'Ningún nombre coincide con la búsqueda.' : 'Aún no hay sugerencias.'}</p>
                ) : (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thSortableStyle} onClick={() => handleSortMusica('nombre')}>Nombre <SortIcon column="nombre" currentColumn={sortMusica.column} dir={sortMusica.dir} /></th>
                        <th style={thSortableStyle} onClick={() => handleSortMusica('cancion')}>Canción <SortIcon column="cancion" currentColumn={sortMusica.column} dir={sortMusica.dir} /></th>
                        <th style={thSortableStyle} onClick={() => handleSortMusica('fecha')}>Fecha <SortIcon column="fecha" currentColumn={sortMusica.column} dir={sortMusica.dir} /></th>
                        <th style={{ ...thStyle, width: 140 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMusica.map((s) => {
                        const key = `musica-${s.id}`;
                        const loadingRow = actionLoading === key;
                        const isArchived = s.spam === true || s.state === 'spam';
                        const label = s.data?.cancion ? `${s.data?.nombre}: ${s.data.cancion}` : (s.data?.nombre ?? 'esta sugerencia');
                        return (
                          <tr key={s.id} style={isArchived ? { background: 'rgba(0,0,0,0.04)' } : undefined}>
                            <td style={tdStyle}>
                              {s.data?.nombre ?? '—'}
                              {isArchived && (
                                <span style={{ marginLeft: 8, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#8b4552', background: 'rgba(139,69,82,0.12)', padding: '2px 8px', borderRadius: 6 }}>Archivada</span>
                              )}
                            </td>
                            <td style={tdStyle}>{s.data?.cancion ?? '—'}</td>
                            <td style={tdStyle}>{formatDate(s.created_at)}</td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {isArchived ? (
                                  <button
                                    type="button"
                                    onClick={() => runAction('musica', s.id, 'restore')}
                                    disabled={loadingRow}
                                    title="Desarchivar (restaurar a la lista principal)"
                                    style={btnIconStyle}
                                  >
                                    {loadingRow ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ArchiveRestore size={14} />}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => runAction('musica', s.id, 'archive')}
                                    disabled={loadingRow}
                                    title="Archivar (ocultar sin borrar)"
                                    style={btnIconStyle}
                                  >
                                    {loadingRow ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Archive size={14} />}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDelete('musica', s.id, label)}
                                  disabled={loadingRow}
                                  title="Eliminar de forma permanente"
                                  style={{ ...btnIconStyle, color: '#c53030' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
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
