/**
 * Netlify Function: sube una foto a Google Drive (álbum del casamiento).
 * Recibe POST multipart/form-data con: nombre (texto), foto (archivo), batchTime (opcional, ms), index (opcional, 1-based).
 * Nombre en Drive: Nombre_YYYY-MM-DD_HH-mm-ss_índice.extension
 *
 * Variables de entorno en Netlify:
 *   GDRIVE_SERVICE_ACCOUNT_JSON: JSON completo de la cuenta de servicio (una línea)
 *   GDRIVE_FOLDER_ID: ID de la carpeta de Drive donde se subirán las fotos
 *
 * Límite: 5 MB por foto (Netlify tiene ~6 MB por request).
 */
const Busboy = require('busboy');
const { google } = require('googleapis');
const { Readable } = require('stream');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let body = event.body;
    if (event.isBase64Encoded) {
      body = Buffer.from(body, 'base64');
    }
    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type'] || '',
      },
    });

    busboy.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      let size = 0;
      file.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_FILE_SIZE) {
          file.resume();
          return;
        }
        chunks.push(chunk);
      });
      file.on('end', () => {
        if (size > MAX_FILE_SIZE) {
          fields[fieldname] = { error: 'file_too_large', filename };
          return;
        }
        fields[fieldname] = {
          filename: filename || 'foto.jpg',
          mimeType: mimeType || 'image/jpeg',
          content: Buffer.concat(chunks),
        };
      });
    });

    busboy.on('field', (name, value) => {
      fields[name] = value;
    });

    busboy.on('error', reject);
    busboy.on('finish', () => resolve(fields));
    busboy.write(body);
    busboy.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const folderId = process.env.GDRIVE_FOLDER_ID;
  const credentialsJson = process.env.GDRIVE_SERVICE_ACCOUNT_JSON;
  if (!folderId || !credentialsJson) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Faltan GDRIVE_FOLDER_ID o GDRIVE_SERVICE_ACCOUNT_JSON en variables de entorno' }),
    };
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'GDRIVE_SERVICE_ACCOUNT_JSON inválido' }),
    };
  }

  let fields;
  try {
    fields = await parseMultipart(event);
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error al leer el formulario: ' + (e.message || 'formato inválido') }),
    };
  }

  const nombre = (fields.nombre && String(fields.nombre).trim()) || 'Invitado';
  const foto = fields.foto || fields.archivo || fields.file;
  if (!foto || !Buffer.isBuffer(foto.content)) {
    if (foto && foto.error === 'file_too_large') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'La foto no puede superar 5 MB. Comprimala o elegí otra.' }),
      };
    }
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Faltan tu nombre o la foto. Elegí una imagen (máx. 5 MB).' }),
    };
  }

  const mime = (foto.mimeType || '').toLowerCase();
  if (!mime.startsWith('image/')) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Solo se aceptan imágenes (JPG, PNG, etc.). No videos.' }),
    };
  }

  const safeName = nombre.replace(/[^\w\s\-áéíóúñ]/gi, '').trim().slice(0, 80) || 'Invitado';
  let ext = (foto.filename && foto.filename.split('.').pop()) || 'jpg';
  ext = ext.replace(/[^a-z0-9]/gi, '') || 'jpg';
  const batchTime = fields.batchTime ? Number(fields.batchTime) : Date.now();
  const indexNum = parseInt(fields.index, 10);
  const index = (isNaN(indexNum) || indexNum < 1) ? '1' : String(indexNum);
  const d = new Date(batchTime);
  const dateStr = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
  const timeStr = [
    String(d.getHours()).padStart(2, '0'),
    String(d.getMinutes()).padStart(2, '0'),
    String(d.getSeconds()).padStart(2, '0'),
  ].join('-');
  const driveFileName = `${safeName}_${dateStr}_${timeStr}_${index}.${ext}`;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    const drive = google.drive({ version: 'v3', auth });
    const stream = Readable.from(foto.content);

    await drive.files.create({
      requestBody: {
        name: driveFileName,
        parents: [folderId],
      },
      media: {
        mimeType: foto.mimeType || 'image/jpeg',
        body: stream,
      },
      fields: 'id, name',
    });
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No se pudo subir la foto. Probá de nuevo más tarde.' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, message: '¡Foto subida! Gracias por compartirla.' }),
  };
};
