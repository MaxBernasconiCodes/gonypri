/**
 * Configuración de la invitación de boda.
 * Podés editar este archivo para reutilizar la invitación en otro casamiento:
 * novios, fecha, lugar, datos bancarios, imágenes, etc.
 */

export const CONFIG = {
  // Novios
  novios: { ella: 'Priki', el: 'Gonza' },

  // Fecha y hora del casamiento (ISO 8601). Se usa para el contador y la lógica día del evento / después.
  fecha: '2026-07-25T21:00:00',
  fechaLegible: '25 de Julio de 2026',

  // Lugar y mapa
  lugar: 'Salón Villa Verde',
  ubicacionURL: 'https://maps.app.goo.gl/XjH4XeYsBGjYK7d59',
  horaFin: '5:00 hs',

  // Datos bancarios (sección Regalos)
  alias: 'priki.gonza.boda',
  titular: 'Priscila Victoria Lopez Figueroa',

  // Media
  audioURL: '/sparkle.mp3',
  imagenFondo: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&q=80&w=1920',
  imagenPortada: '/portada.jpeg',
  fotosCarrusel: [
    '/1.jpeg', '/2.jpeg', '/3.jpeg', '/4.jpeg',
    '/5.jpeg', '/6.jpeg', '/7.jpeg', '/8.jpeg',
  ],
};
