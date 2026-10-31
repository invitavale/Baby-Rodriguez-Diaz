/* =========================================================
   Revelación de Género · Baby Rodríguez Díaz
   Flujo: sello → video (8 s) + música → ¿familia o amigo? →
          nombre → bienvenida → invitación
   ========================================================= */

/* ---------- 1. LISTA DE INVITADOS ----------
   pases = cantidad de personas incluidas en la invitación.
   seccion: 'familias', grupo: 'familia' o 'individuales' (títulos en la lista).
   miembros: integrantes; al tocar la familia se abre y cada quien elige su nombre. */
const INVITADOS = [
  { nombre: 'Wislenia',              pases: 1, seccion: 'familias', grupo: 'familia' },
  { nombre: 'Leudy',                 pases: 1, seccion: 'familias', grupo: 'familia' },
  { nombre: 'Familia Antinol',       pases: 4, seccion: 'familias', grupo: 'familia', miembros: ['Doña Dulce', 'Mildred', 'Ruthdeliz', 'Antinol'] },
  { nombre: 'Familia Kervis',        pases: 4, seccion: 'familias', grupo: 'familia', miembros: ['Iris', 'Keven', 'Kevin', 'Kervis'] },
  { nombre: 'Christopher y Keiry',   pases: 2, seccion: 'familias', grupo: 'familia' },
  { nombre: 'Familia Yaritza',       pases: 5, seccion: 'familias', grupo: 'familia', miembros: ['Yaha', 'Ismaylin', 'Darlyn', 'María', 'Yaritza'] },
  { nombre: 'Familia Juana',         pases: 3, seccion: 'familias', grupo: 'familia', miembros: ['Wilman', 'Yerlenis', 'Juana'] },
  { nombre: 'William y Lidia',       pases: 2, seccion: 'familias', grupo: 'familia' },
  { nombre: 'Omell',                 pases: 1, seccion: 'familias', grupo: 'familia' },

  { nombre: 'Rosa Iris',             pases: 1, seccion: 'individuales', grupo: 'amigo' },
  { nombre: 'Rosanny',               pases: 1, seccion: 'individuales', grupo: 'amigo' },
  { nombre: 'Isael',                 pases: 1, seccion: 'individuales', grupo: 'amigo' },
  { nombre: 'Nathanael',             pases: 1, seccion: 'individuales', grupo: 'amigo' },
  { nombre: 'Génesis',               pases: 1, seccion: 'individuales', grupo: 'amigo' },
  { nombre: 'Gris Mairy',            pases: 1, seccion: 'individuales', grupo: 'amigo' },
  { nombre: 'Joel',                  pases: 2, seccion: 'individuales', grupo: 'amigo' }
];
const unirNombres = (arr) => arr.length < 2 ? (arr[0] || '') : arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
const SECCIONES = { familias: 'Familias y parejas', individuales: 'Invitados individuales' };

// WhatsApp que recibe las confirmaciones (código de país + número, sin signos)
const WHATSAPP = '18299737147';

const TEXTO_BIENVENIDA = 'Bienvenido a mi revelación';
const TEXTO_FRASE      = 'pronto sabré lo que soy…';
const DURACION_BIENVENIDA = 8200; // ms que dura la pantalla de bienvenida

/* ---------- Referencias ---------- */
const $ = (id) => document.getElementById(id);
const musica      = $('musica');
const video       = $('videoSobre');
const escenaSobre = $('escenaSobre');
const escenaBv    = $('escenaBienvenida');
const carta       = $('carta');
const pasoTipo    = $('pasoTipo');
const pasoNombre  = $('pasoNombre');
const lista       = $('listaNombres');
const buscar      = $('buscarNombre');
const btnMusica   = $('btnMusica');
const invitacion  = $('invitacion');

let abierto = false;
let cartaMostrada = false;
let tipoElegido = null;
let musicaActiva = false;   // la persona quiere música
let pausadaPorOcultar = false;

/* =========================================================
   2. MÚSICA — el toque en el sello es el gesto que
   desbloquea el audio en Safari, Chrome, Firefox, etc.
   ========================================================= */
function iniciarMusica() {
  musicaActiva = true;
  musica.volume = 0;
  const p = musica.play();
  if (p && p.catch) p.catch(() => { /* si el navegador lo bloquea, el botón queda en pausa */ marcarBoton(); });
  subirVolumen();
  marcarBoton();
}
function subirVolumen() {
  let v = 0;
  const t = setInterval(() => {
    v = Math.min(1, v + 0.05);
    try { musica.volume = v; } catch (e) {}
    if (v >= 1) clearInterval(t);
  }, 90);
}
function marcarBoton() {
  const pausado = musica.paused;
  btnMusica.classList.toggle('pausado', pausado);
  btnMusica.setAttribute('aria-label', pausado ? 'Reproducir música' : 'Pausar música');
}
btnMusica.addEventListener('click', () => {
  if (musica.paused) { musica.play().catch(() => {}); musicaActiva = true; }
  else { musica.pause(); musicaActiva = false; }
});
musica.addEventListener('play', marcarBoton);
musica.addEventListener('pause', marcarBoton);

// Pausa al salir de la pestaña/app y retoma al volver
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (!musica.paused) { musica.pause(); pausadaPorOcultar = true; }
  } else if (pausadaPorOcultar && musicaActiva) {
    musica.play().catch(() => {});
    pausadaPorOcultar = false;
  }
});

/* =========================================================
   3. ABRIR EL SOBRE (video)
   ========================================================= */
function abrirSobre() {
  if (abierto) return;
  abierto = true;
  escenaSobre.classList.add('abierto');

  iniciarMusica();                 // primero el audio (dentro del gesto)
  lanzarPolvo();
  btnMusica.classList.add('visible');

  video.muted = true;
  video.currentTime = 0;
  const p = video.play();
  if (p && p.catch) p.catch(() => mostrarCarta()); // si no reproduce, saltamos a la carta

  // Seguros por si el evento "ended" no llega (video lento o bloqueado)
  video.addEventListener('playing', () => setTimeout(mostrarCarta, 8800), { once: true });
  setTimeout(mostrarCarta, 15000);
}
$('btnAbrir').addEventListener('click', abrirSobre);

/* Polvo mágico dorado que sale del sello */
function lanzarPolvo() {
  const polvo = $('polvo');
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colores = ['#e2ad4c', '#f0c46a', '#d79b33', '#f7dc93', '#9fc3e7', '#efa2b3'];
  const total = window.innerWidth < 600 ? 110 : 140;
  for (let i = 0; i < total; i++) {
    const c = document.createElement('span');
    c.className = 'chispa' + (Math.random() < 0.22 ? ' estrella' : '');
    const ang = (i / total) * Math.PI * 2 * 3 + Math.random() * 0.4; // reparte alrededor del centro
    const dist = 70 + Math.random() * 230;
    const t = c.classList.contains('estrella') ? 10 + Math.random() * 10 : 3 + Math.random() * 6;
    c.style.setProperty('--x', (Math.cos(ang) * dist).toFixed(0) + 'px');
    c.style.setProperty('--y', (Math.sin(ang) * dist).toFixed(0) + 'px');
    c.style.setProperty('--dx', (Math.random() * 60 - 30).toFixed(0) + 'px');
    c.style.setProperty('--g', (Math.random() * 360 - 180).toFixed(0) + 'deg');
    c.style.setProperty('--t', t.toFixed(1) + 'px');
    c.style.setProperty('--c', colores[i % colores.length]);
    c.style.setProperty('--d', (1.3 + Math.random() * 1.3).toFixed(2) + 's');
    c.style.setProperty('--r', (Math.random() * 0.25).toFixed(2) + 's');
    polvo.appendChild(c);
  }
  polvo.classList.add('activo');
  setTimeout(() => { polvo.innerHTML = ''; polvo.classList.remove('activo'); }, 4200);
}
escenaSobre.addEventListener('click', (e) => {
  if (!abierto && !e.target.closest('.carta')) abrirSobre();
});

video.addEventListener('timeupdate', () => {
  // Nombres de los papás: aparecen ~1 s y se van antes de que se abra la carta
  $('padresVideo').classList.toggle('visible', video.currentTime > 0.9 && video.currentTime < 5.4);
  if (video.duration && video.currentTime >= video.duration - 0.55) mostrarCarta();
});
video.addEventListener('ended', mostrarCarta);
video.addEventListener('error', () => { if (abierto) mostrarCarta(); });

function mostrarCarta() {
  if (cartaMostrada) return;
  cartaMostrada = true;
  // Si el video no llegó al final (error/bloqueo), mostramos la carta como imagen fija
  if (!video.duration || video.currentTime < video.duration - 1.2) {
    video.pause();
    video.style.opacity = '0';
  }
  carta.classList.add('visible');
  pasoTipo.classList.add('entra');
}

/* =========================================================
   4. ¿FAMILIA O AMIGO?
   ========================================================= */
document.querySelectorAll('.opcion').forEach((btn) => {
  btn.addEventListener('click', () => {
    tipoElegido = btn.dataset.tipo;
    $('saludoTipo').textContent = tipoElegido === 'familia'
      ? '¡Qué alegría, familia!'
      : '¡Qué alegría tenerte aquí!';
    cambiarPaso(pasoTipo, pasoNombre);
    pintarLista('');
    buscar.value = '';
  });
});

$('btnVolver').addEventListener('click', () => cambiarPaso(pasoNombre, pasoTipo));

function cambiarPaso(desde, hacia) {
  desde.classList.remove('entra');
  desde.classList.add('sale');
  setTimeout(() => {
    desde.classList.add('oculto');
    desde.classList.remove('sale');
    hacia.classList.remove('oculto');
    hacia.classList.remove('entra');
    void hacia.offsetWidth; // reinicia animación
    hacia.classList.add('entra');
  }, 420);
}

/* =========================================================
   5. LISTA DE NOMBRES
   ========================================================= */
const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const iniciales = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

function invitadosDelGrupo() {
  const conGrupo = INVITADOS.some((i) => i.grupo);
  return conGrupo ? INVITADOS.filter((i) => i.grupo === tipoElegido) : INVITADOS;
}

function pintarLista(filtro) {
  const f = normalizar(filtro.trim());
  const items = invitadosDelGrupo().filter((i) => !f || normalizar(i.nombre + ' ' + (i.miembros || []).join(' ')).includes(f));

  lista.innerHTML = '';
  let seccionActual = null;
  const variasSecciones = new Set(items.map((i) => i.seccion)).size > 1;
  items.forEach((inv, idx) => {
    if (variasSecciones && inv.seccion && inv.seccion !== seccionActual) {
      seccionActual = inv.seccion;
      const t = document.createElement('li');
      t.className = 'lista-seccion';
      t.textContent = SECCIONES[inv.seccion] || inv.seccion;
      t.style.animationDelay = (f ? 0 : 0.45 + idx * 0.04) + 's';
      lista.appendChild(t);
    }
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'nombre-btn';
    b.setAttribute('role', 'option');
    b.style.animationDelay = (f ? 0 : 0.5 + idx * 0.04) + 's';
    const p = inv.pases || 1;
    const esFamilia = Array.isArray(inv.miembros) && inv.miembros.length > 0;
    b.innerHTML = `<span class="ini"></span><span class="nb-texto"><span class="nb-nombre"></span><span class="nb-pases">${p} ${p === 1 ? 'persona' : 'personas'}${esFamilia ? ' · toca para ver quién eres' : ''}</span></span>`;
    b.querySelector('.ini').textContent = iniciales(inv.nombre.replace(/^Familia\s+/i, ''));
    b.querySelector('.nb-nombre').textContent = inv.nombre;
    li.appendChild(b);

    if (esFamilia) {
      // La familia se abre y muestra a cada integrante para que elija su nombre
      b.classList.add('nb-familia');
      b.setAttribute('aria-expanded', 'false');
      b.insertAdjacentHTML('beforeend', '<svg class="nb-flecha" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
      const sub = document.createElement('ul');
      sub.className = 'miembros-lista';
      inv.miembros.forEach((m, k) => {
        const mli = document.createElement('li');
        const mb = document.createElement('button');
        mb.type = 'button';
        mb.className = 'miembro-btn';
        mb.style.setProperty('--k', k);
        mb.innerHTML = '<span class="m-punto"></span><span></span>';
        mb.lastChild.textContent = m;
        mb.addEventListener('click', (e) => elegirNombre(inv, mb, e, m));
        mli.appendChild(mb);
        sub.appendChild(mli);
      });
      li.appendChild(sub);
      li.classList.add('li-familia');
      b.addEventListener('click', () => {
        const abrir = !li.classList.contains('abierta');
        lista.querySelectorAll('.li-familia.abierta').forEach((x) => {
          x.classList.remove('abierta');
          x.querySelector('.nb-familia').setAttribute('aria-expanded', 'false');
        });
        if (abrir) {
          li.classList.add('abierta');
          b.setAttribute('aria-expanded', 'true');
          setTimeout(() => li.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 260);
        }
      });
      // Si buscan el nombre de un integrante, la familia aparece abierta
      if (f && inv.miembros.some((m) => normalizar(m).includes(f))) {
        li.classList.add('abierta');
        b.setAttribute('aria-expanded', 'true');
      }
    } else {
      b.addEventListener('click', (e) => elegirNombre(inv, b, e));
    }
    lista.appendChild(li);
  });
  $('sinResultados').classList.toggle('oculto', items.length > 0);
}
buscar.addEventListener('input', () => pintarLista(buscar.value));

/* =========================================================
   6. TRANSICIÓN → BIENVENIDA
   ========================================================= */
let nombreElegido = '';
let pasesElegidos = 1;
let miembrosElegidos = [];
let familiaElegida = '';

function elegirNombre(inv, boton, evento, miembro) {
  if (nombreElegido) return;
  const nombre = miembro || inv.nombre;
  nombreElegido = nombre;
  familiaElegida = miembro ? inv.nombre : '';
  pasesElegidos = inv.pases || 1;
  miembrosElegidos = inv.miembros || [];
  boton.classList.add('elegido');
  buscar.blur();

  // Destello de luz que nace desde el nombre tocado
  const r = boton.getBoundingClientRect();
  const flash = document.createElement('div');
  flash.className = 'flash';
  flash.style.left = (evento && evento.clientX ? evento.clientX : r.left + r.width / 2) + 'px';
  flash.style.top  = (evento && evento.clientY ? evento.clientY : r.top + r.height / 2) + 'px';
  document.body.appendChild(flash);

  setTimeout(() => {
    prepararBienvenida(nombre);
    escenaSobre.classList.remove('activa');
    escenaBv.classList.add('activa');
  }, 1000);
  setTimeout(() => flash.remove(), 1700);
}

function letras(el, texto, inicio, paso) {
  el.textContent = '';
  let i = 0;
  texto.split(' ').forEach((palabra, w, arr) => {
    const span = document.createElement('span');
    span.style.whiteSpace = 'nowrap';
    span.style.display = 'inline-block';
    [...palabra].forEach((ch) => {
      const l = document.createElement('span');
      l.className = 'letra';
      l.textContent = ch;
      l.style.setProperty('--dl', (inicio + i * paso).toFixed(2) + 's');
      span.appendChild(l);
      i++;
    });
    el.appendChild(span);
    if (w < arr.length - 1) { el.appendChild(document.createTextNode(' ')); i++; }
  });
  return inicio + i * paso;
}

function prepararBienvenida(nombre) {
  $('bvNombre').textContent = 'Hola,';
  const bvStrong = document.createElement('strong');
  bvStrong.textContent = nombre;
  $('bvNombre').appendChild(bvStrong);
  $('bvMiembros').textContent = familiaElegida;
  $('bvMiembros').classList.toggle('oculto', !familiaElegida);
  $('bvTitulo').setAttribute('aria-label', TEXTO_BIENVENIDA);
  $('bvFrase').setAttribute('aria-label', TEXTO_FRASE);
  const finTitulo = letras($('bvTitulo'), TEXTO_BIENVENIDA, 0.7, 0.055);
  const finFrase  = letras($('bvFrase'),  TEXTO_FRASE, finTitulo + 0.3, 0.045);
  escenaBv.style.setProperty('--firma', (finFrase + 0.4).toFixed(2) + 's');
  crearDestellos();

  setTimeout(entrarInvitacion, DURACION_BIENVENIDA);
}

function crearDestellos() {
  const cont = $('destellos');
  cont.innerHTML = '';
  for (let i = 0; i < 34; i++) {
    const d = document.createElement('span');
    d.className = 'destello';
    d.style.left = Math.random() * 100 + '%';
    d.style.top = Math.random() * 100 + '%';
    d.style.setProperty('--t', (4 + Math.random() * 8).toFixed(1) + 'px');
    d.style.setProperty('--d', (2 + Math.random() * 3).toFixed(2) + 's');
    d.style.setProperty('--r', (Math.random() * 3).toFixed(2) + 's');
    cont.appendChild(d);
  }
}

/* =========================================================
   7. ENTRAR A LA INVITACIÓN
   ========================================================= */
let dentro = false;
function entrarInvitacion() {
  if (dentro) return;
  dentro = true;
  escenaBv.classList.add('saliendo');
  $('nombreInvitado').textContent = nombreElegido;
  $('portadaHolaPre').textContent = / y /.test(nombreElegido) ? 'Queridos' : 'Querido(a)';
  $('portadaMiembros').textContent = familiaElegida;
  $('portadaMiembros').classList.toggle('oculto', !familiaElegida);

  prepararCantidad();
  restaurarVoto();
  restaurarRsvp();
  cargarConteo();

  setTimeout(() => {
    escenaBv.classList.remove('activa');
    invitacion.classList.add('visible');
    document.body.classList.add('puede-scroll');
    window.scrollTo(0, 0);
    activarRevelado();
  }, 1200);
}

/* =========================================================
   8. DATOS DEL EVENTO
   ========================================================= */
const EVENTO = {
  id: 'revelacion-baby-rodriguez-diaz',          // id en Supabase (rsvp_eventos)
  fecha: new Date('2026-11-22T17:30:00-04:00'),   // 5:30 p. m. hora RD
  lugar: {
    nombre: 'Residencial Vista Sol',
    direccion: 'La Barranquita, edificio 10, apartamento 3A',
    mapa: 'https://maps.app.goo.gl/4Bf6JdVHFJHnMXPm8'
  }
};

const SUPABASE_URL = 'https://nsujtmfmyoeibbvwkzez.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vngm39TRXt50jchjL2_gGQ_kZIl_n_P';

async function rpc(fn, params) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!r.ok) throw new Error((await r.text()) || r.statusText);
  return r.json();
}

const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const leer = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
const claveInvitado = (k) => `${EVENTO.id}:${k}:${normalizar(nombreElegido)}`;

// Lugar
if (EVENTO.lugar.nombre) {
  $('lugarNombre').textContent = EVENTO.lugar.nombre;
  $('lugarDireccion').textContent = EVENTO.lugar.direccion;
}
if (EVENTO.lugar.mapa) {
  $('lugarMapa').href = EVENTO.lugar.mapa;
  $('lugarMapa').classList.remove('oculto');
}

/* ---------- Revelado al hacer scroll ---------- */
function activarRevelado() {
  const els = document.querySelectorAll('.rev');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

/* =========================================================
   9. CONTEO REGRESIVO
   ========================================================= */
const dos = (n) => String(n).padStart(2, '0');
function tic() {
  const ms = EVENTO.fecha - new Date();
  if (ms <= 0) {
    $('conteoCaja').classList.add('oculto');
    $('conteoFin').classList.remove('oculto');
    return;
  }
  const s = Math.floor(ms / 1000);
  $('cDias').textContent = dos(Math.floor(s / 86400));
  $('cHoras').textContent = dos(Math.floor((s % 86400) / 3600));
  $('cMin').textContent = dos(Math.floor((s % 3600) / 60));
  $('cSeg').textContent = dos(s % 60);
}
tic();
setInterval(tic, 1000);

/* =========================================================
   10. DINÁMICA ¿NIÑO O NIÑA?  (votos en Supabase)
   ========================================================= */
const EQUIPOS = {
  nino: {
    nombre: 'Team Niño', colores: ['#9fc3e7', '#6f9fcf', '#d8e8f7', '#c9a46a'],
    globos: ['azul', 'estrella-azul', 'corazon-azul', 'confeti-azul'],
    que: 'Toallitas húmedas', nota: 'Como apuestas por niño, tu aporte para el bebé son toallitas húmedas.',
    icono: '<svg viewBox="0 0 32 32"><rect x="5" y="9" width="22" height="16" rx="4"/><path d="M12 9c0-2.5 1.8-4 4-4s4 1.5 4 4"/><path d="M11 17h10"/></svg>',
    vest: 'Tú vienes de blanco con un toque azul 💙'
  },
  nina: {
    nombre: 'Team Niña', colores: ['#f2b5c0', '#df8b9c', '#fbe0e6', '#c9a46a'],
    globos: ['rosa', 'estrella-rosa', 'corazon-rosa', 'confeti-rosa'],
    que: 'Pampers (pañales)', nota: 'Como apuestas por niña, tu aporte para el bebé son pañales.',
    icono: '<svg viewBox="0 0 32 32"><path d="M4 9h24v5c0 6-5 11-12 11S4 20 4 14V9Z"/><path d="M4 13c3 0 5 2 6 5M28 13c-3 0-5 2-6 5"/><path d="M9 9V7h14v2"/></svg>',
    vest: 'Tú vienes de blanco con un toque rosado 💗'
  },
  sorpresa: {
    nombre: 'Que Dios nos sorprenda', colores: ['#9fc3e7', '#f2b5c0', '#e9dcc4', '#c9a46a'],
    globos: ['azul', 'rosa', 'estrella-azul', 'estrella-rosa', 'corazon-azul', 'corazon-rosa', 'confeti-azul', 'confeti-rosa'],
    que: 'Un regalito sorpresa', nota: 'En colores neutrales: blanco, beige, crema o gris.',
    icono: '<svg viewBox="0 0 32 32"><rect x="5" y="12" width="22" height="15" rx="2"/><path d="M3.5 12h25v-3.5h-25zM16 8.5V27"/><path d="M16 8.5c-2-4-7-4.5-7-1.5 0 2 3.5 1.5 7 1.5ZM16 8.5c2-4 7-4.5 7-1.5 0 2-3.5 1.5-7 1.5Z"/></svg>',
    vest: 'Tú puedes venir todo de blanco, o con un toque azul o rosado 🤍'
  }
};

let conteo = { nino: 0, nina: 0, sorpresa: 0 };
let miVoto = null;
let modoDemo = false; // si Supabase no responde (p. ej. vista previa), se cuenta localmente

async function cargarConteo() {
  try {
    conteo = await rpc('revelacion_conteo', { p_event: EVENTO.id });
  } catch (e) {
    modoDemo = true;
    conteo = leer(`${EVENTO.id}:demo`) || { nino: 0, nina: 0, sorpresa: 0 };
  }
  pintarMarcador();
}

function pintarMarcador() {
  const n = conteo.nino || 0, a = conteo.nina || 0, s = conteo.sorpresa || 0;
  const tot = n + a;
  const pn = tot ? Math.round((n / tot) * 100) : 50;
  const pa = tot ? 100 - pn : 50;
  $('mAzul').style.width = pn + '%';
  $('mRosa').style.width = pa + '%';
  $('mNino').textContent = n;
  $('mNina').textContent = a;
  $('mNinoPct').textContent = (tot ? pn : 0) + '%';
  $('mNinaPct').textContent = (tot ? pa : 0) + '%';
  $('mSorpresa').textContent = s;
  $('mBarra').setAttribute('aria-label', `Team Niño ${n} votos, Team Niña ${a} votos`);

  const lider = $('mLider');
  if (!tot && !s) lider.textContent = '¡Sé el primero en votar!';
  else if (n > a) lider.innerHTML = 'Va ganando <span class="t-azul">Team Niño</span> 💙';
  else if (a > n) lider.innerHTML = 'Va ganando <span class="t-rosa">Team Niña</span> 💗';
  else lider.textContent = '¡Empate! Todo puede pasar ✨';
}

document.querySelectorAll('.equipo').forEach((btn) => {
  btn.addEventListener('click', () => votar(btn.dataset.equipo));
});
$('btnCambiarVoto').addEventListener('click', () => {
  $('equipos').classList.remove('votado');
  $('equipos').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

async function votar(equipo) {
  if (!nombreElegido) return;
  const anterior = miVoto;
  miVoto = equipo;
  mostrarEleccion(equipo, true);

  try {
    if (modoDemo) throw new Error('demo');
    conteo = await rpc('revelacion_votar', { p_event: EVENTO.id, p_nombre: nombreElegido, p_equipo: equipo });
  } catch (e) {
    modoDemo = true;
    if (anterior && conteo[anterior] > 0) conteo[anterior]--;
    conteo[equipo] = (conteo[equipo] || 0) + 1;
    guardar(`${EVENTO.id}:demo`, conteo);
  }
  guardar(claveInvitado('voto'), equipo);
  pintarMarcador();
}

function mostrarEleccion(equipo, celebrar) {
  const eq = EQUIPOS[equipo];
  document.querySelectorAll('.equipo').forEach((b) => b.classList.toggle('elegido', b.dataset.equipo === equipo));
  $('equipos').classList.add('votado');
  $('marcador').classList.remove('oculto');

  const ll = $('llevar');
  ll.className = 'llevar ' + equipo;
  $('llevarEquipo').textContent = eq.nombre;
  $('llevarIcono').innerHTML = eq.icono;
  $('llevarQue').textContent = eq.que;
  $('llevarNota').textContent = eq.nota;
  $('llevarExtra').classList.toggle('oculto', equipo === 'sorpresa');

  document.querySelectorAll('.vest').forEach((v) => v.classList.toggle('tuyo', v.dataset.equipo === equipo));
  $('vestTuyo').textContent = eq.vest;
  $('vestTuyo').classList.remove('oculto');

  if (celebrar) {
    lanzarGlobos(eq);
    lanzarConfeti(eq.colores);
    setTimeout(() => ll.scrollIntoView({ behavior: 'smooth', block: 'center' }), 900);
  }
}

function restaurarVoto() {
  const v = leer(claveInvitado('voto'));
  if (v && EQUIPOS[v]) { miVoto = v; mostrarEleccion(v, false); }
}

/* ---------- Globos y confeti ---------- */
const reducirMov = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function lanzarGlobos(eq) {
  if (reducirMov) return;
  const capa = $('lluviaGlobos');
  const ancho = window.innerWidth;
  const total = ancho < 600 ? 12 : 18;
  for (let i = 0; i < total; i++) {
    const img = document.createElement('img');
    img.src = `assets/globos/${eq.globos[i % eq.globos.length]}.webp`;
    img.alt = '';
    img.className = 'globo-vuelo';
    const w = 60 + Math.random() * (ancho < 600 ? 50 : 80);
    img.style.width = w + 'px';
    img.style.left = (Math.random() * (ancho - w * 0.6) - w * 0.2) + 'px';
    img.style.setProperty('--s', (4.5 + Math.random() * 2.5).toFixed(2) + 's');
    img.style.setProperty('--r', (Math.random() * 1.2).toFixed(2) + 's');
    img.style.setProperty('--x1', (Math.random() * 60 - 30).toFixed(0) + 'px');
    img.style.setProperty('--x2', (Math.random() * 60 - 30).toFixed(0) + 'px');
    capa.appendChild(img);
    setTimeout(() => img.remove(), 9000);
  }
}

function lanzarConfeti(colores) {
  if (reducirMov || typeof confetti !== 'function') return;
  const base = { colors: colores, zIndex: 70, disableForReducedMotion: true };
  confetti({ ...base, particleCount: 120, spread: 80, startVelocity: 48, origin: { y: 0.7 } });
  setTimeout(() => {
    confetti({ ...base, particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } });
    confetti({ ...base, particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } });
  }, 350);
}

/* =========================================================
   11. CONFIRMAR ASISTENCIA  (botón → WhatsApp con mensaje listo)
   ========================================================= */
function prepararCantidad() { /* se mantiene por compatibilidad */ }

function mensajeWhatsApp() {
  const lineas = [
    '¡Hola! Confirmo mi asistencia a la revelación de género de Baby Rodríguez Díaz 💙💗',
    '',
    `👤 Nombre: ${nombreElegido}`
  ];
  if (familiaElegida) lineas.push(`👨‍👩‍👧 ${familiaElegida}: ${unirNombres(miembrosElegidos)}`);
  lineas.push(`✅ Cupo: ${pasesElegidos} ${pasesElegidos === 1 ? 'persona' : 'personas'}`);
  if (miVoto) lineas.push(`🎈 Mi predicción: ${EQUIPOS[miVoto].nombre}`);
  return lineas.join('\n');
}

$('rsvpEnviar').addEventListener('click', () => {
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensajeWhatsApp())}`;
  window.__ultimoWa = url;
  const a = document.createElement('a');
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
  lanzarConfeti(['#9fc3e7', '#f2b5c0', '#e9dcc4', '#c9a46a']);
});

function restaurarRsvp() {}
