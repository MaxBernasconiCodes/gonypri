/**
 * Netlify Function: devuelve las respuestas de los formularios RSVP y Música.
 * Requiere en Netlify (Site settings → Environment variables):
 *   - NETLIFY_AUTH_TOKEN: token de acceso personal de Netlify
 *   - NETLIFY_SITE_ID: API ID del sitio (Site configuration → General)
 *   - ADMIN_SECRET: clave para acceder a esta función (la que usan en /admin)
 */
const NETLIFY_API = 'https://api.netlify.com/api/v1';

async function getFormSubmissions(siteId, formId, token, includeArchived) {
  const url = `${NETLIFY_API}/sites/${siteId}/forms/${formId}/submissions`;
  const r = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!r.ok) return [];
  const data = await r.json();
  let list = Array.isArray(data) ? data : [];
  // Netlify puede devolver solo "verified"; si pedimos archivadas y hay filtro, aquí se podría llamar también al listado de spam.
  if (!includeArchived && list.some((s) => s.spam)) {
    list = list.filter((s) => !s.spam);
  }
  return list;
}

async function listForms(siteId, token) {
  const r = await fetch(`${NETLIFY_API}/sites/${siteId}/forms`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const qs = event.queryStringParameters || {};
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : qs.token || '';
  const includeArchived = qs.include_archived === '1';

  const adminSecret = process.env.ADMIN_SECRET;
  const siteId = process.env.NETLIFY_SITE_ID;
  const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;

  if (!adminSecret || token !== adminSecret) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No autorizado' }),
    };
  }

  if (!siteId || !netlifyToken) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Faltan NETLIFY_SITE_ID o NETLIFY_AUTH_TOKEN en variables de entorno',
      }),
    };
  }

  try {
    const forms = await listForms(siteId, netlifyToken);
    const byName = {};
    forms.forEach((f) => { byName[f.name] = f.id; });

    const [rsvp, musica] = await Promise.all([
      byName.rsvp
        ? getFormSubmissions(siteId, byName.rsvp, netlifyToken, includeArchived)
        : [],
      byName.musica
        ? getFormSubmissions(siteId, byName.musica, netlifyToken, includeArchived)
        : [],
    ]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rsvp, musica }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Error al obtener respuestas' }),
    };
  }
};
