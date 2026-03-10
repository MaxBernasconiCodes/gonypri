/**
 * Netlify Function: archivar, restaurar o eliminar una respuesta de formulario.
 * POST body: { action: 'archive'|'restore'|'delete', formName: 'rsvp'|'musica', submissionId: string }
 * Requiere las mismas env vars que get-form-submissions (ADMIN_SECRET, NETLIFY_SITE_ID, NETLIFY_AUTH_TOKEN).
 */
const NETLIFY_API = 'https://api.netlify.com/api/v1';

async function listForms(siteId, token) {
  const r = await fetch(`${NETLIFY_API}/sites/${siteId}/forms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return [];
  const data = await r.json();
  return Array.isArray(data) ? data : [];
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authHeader = event.headers.authorization || event.headers.Authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : '';

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

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Body JSON inválido' }),
    };
  }

  const { action, formName, submissionId } = body;
  const allowedActions = ['archive', 'restore', 'delete'];
  const allowedForms = ['rsvp', 'musica'];

  if (!allowedActions.includes(action) || !allowedForms.includes(formName) || !submissionId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Faltan action (archive|restore|delete), formName (rsvp|musica) o submissionId',
      }),
    };
  }

  try {
    // La API de Netlify usa /submissions/{id} para spam, ham y delete (no bajo sites/forms)
    const base = `${NETLIFY_API}/submissions/${submissionId}`;
    const headers = { Authorization: `Bearer ${netlifyToken}` };

    if (action === 'archive') {
      const r = await fetch(`${base}/spam`, { method: 'PUT', headers });
      if (!r.ok) {
        const err = await r.text();
        throw new Error(err || 'Error al archivar');
      }
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, action: 'archived' }) };
    }

    if (action === 'restore') {
      const r = await fetch(`${base}/ham`, { method: 'PUT', headers });
      if (!r.ok) {
        const err = await r.text();
        throw new Error(err || 'Error al restaurar');
      }
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, action: 'restored' }) };
    }

    if (action === 'delete') {
      const r = await fetch(base, { method: 'DELETE', headers });
      if (!r.ok) {
        const err = await r.text();
        throw new Error(err || 'Error al eliminar');
      }
      return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, action: 'deleted' }) };
    }

    return { statusCode: 400, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Acción no válida' }) };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Error al ejecutar la acción' }),
    };
  }
};
