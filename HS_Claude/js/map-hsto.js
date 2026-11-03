(function () {
  'use strict';
  var cfg = window.HSTO_MAP, wrap = document.getElementById('hMap'), box = document.getElementById('hMapHsto');
  if (!cfg || !wrap || !box) return;
  if (!cfg.MAPTILER_KEY || /COLOQUE_AQUI/.test(cfg.MAPTILER_KEY)) {
    console.info('[HSTO mapa] Chave MapTiler não definida (js/map-config.js). A usar o mapa do Google.');
    return;
  }

  var GL_VER = '4.7.1', started = false, done = false;
  var KEY = encodeURIComponent(cfg.MAPTILER_KEY);
  var gmaps = 'https://www.google.com/maps/search/?api=1&query=' + cfg.HSTO_CENTER[1] + ',' + cfg.HSTO_CENTER[0];
  var C = {
    ivory: '#F2EBDD', land: '#F5EFE3', sage: '#78947F', emerald: '#185844', forest: '#102F27', gold: '#B08A4F',
    water: '#D6E6E0', sand: '#EEE3CB', park: '#D3DCCB', wood: '#C4D1BE',
    building: '#E8DDC6', buildingTop: '#EFE6D2', roadMain: '#E2D3B6', roadSec: '#ECE1CB', roadMinor: '#F9F5EB', path: '#DCCFB4'
  };
  var nameExpr = ['coalesce', ['get', 'name:pt'], ['get', 'name:latin'], ['get', 'name']];
  var FONT = ['Noto Sans Regular'];

  function style() {
    var T = 'https://api.maptiler.com/tiles/v3/tiles.json?key=' + KEY;
    var roadW = function (a, b, c) { return ['interpolate', ['exponential', 1.4], ['zoom'], 13, a, 16, b, 19, c]; };
    var road = function (id, cls, color, w) {
      return { id: id, type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: 12,
        filter: ['all', ['==', '$type', 'LineString'], ['in', 'class'].concat(cls), ['!in', 'brunnel', 'tunnel']],
        layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': w } };
    };
    return {
      version: 8,
      glyphs: 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=' + KEY,
      sources: { omt: { type: 'vector', url: T } },
      light: { anchor: 'viewport', color: '#FFF8EA', intensity: 0.38, position: [1.2, 215, 45] },
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': C.land } },
        { id: 'sand', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['==', 'class', 'sand'], paint: { 'fill-color': C.sand } },
        { id: 'grass', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['in', 'class', 'grass', 'farmland'], paint: { 'fill-color': C.park, 'fill-opacity': 0.8 } },
        { id: 'wood', type: 'fill', source: 'omt', 'source-layer': 'landcover', filter: ['==', 'class', 'wood'], paint: { 'fill-color': C.wood, 'fill-opacity': 0.85 } },
        { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', paint: { 'fill-color': C.park, 'fill-opacity': 0.9 } },
        { id: 'landuse-green', type: 'fill', source: 'omt', 'source-layer': 'landuse', filter: ['in', 'class', 'park', 'cemetery', 'pitch', 'playground'], paint: { 'fill-color': C.park } },
        { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': C.water } },
        { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway', paint: { 'line-color': C.water, 'line-width': 2 } },
        road('road-path', ['path', 'pedestrian', 'track'], C.path, roadW(0.4, 1, 2)),
        road('road-minor', ['minor', 'service'], C.roadMinor, roadW(1, 4, 10)),
        road('road-sec', ['tertiary', 'secondary'], C.roadSec, roadW(1.5, 6, 14)),
        road('road-main', ['primary', 'trunk', 'motorway'], C.roadMain, roadW(2, 8, 18)),
        { id: 'building-3d', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 14,
          paint: {
            'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 8], 0, C.building, 40, C.buildingTop],
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
            'fill-extrusion-opacity': 0.95, 'fill-extrusion-vertical-gradient': true } },
        { id: 'road-label', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 14,
          layout: { 'symbol-placement': 'line', 'text-field': nameExpr, 'text-font': FONT, 'text-size': ['interpolate', ['linear'], ['zoom'], 14, 10, 18, 13] },
          paint: { 'text-color': C.forest, 'text-halo-color': C.ivory, 'text-halo-width': 1.6 } },
        { id: 'water-label', type: 'symbol', source: 'omt', 'source-layer': 'water_name', layout: { 'text-field': nameExpr, 'text-font': FONT, 'text-size': 12, 'text-letter-spacing': 0.15 },
          paint: { 'text-color': C.emerald, 'text-opacity': 0.8, 'text-halo-color': C.water, 'text-halo-width': 1.2 } },
        { id: 'place-label', type: 'symbol', source: 'omt', 'source-layer': 'place', filter: ['in', 'class', 'city', 'town', 'village', 'suburb', 'neighbourhood'],
          layout: { 'text-field': nameExpr, 'text-font': FONT, 'text-size': ['match', ['get', 'class'], 'city', 18, 'town', 16, 14], 'text-letter-spacing': 0.06, 'text-max-width': 8 },
          paint: { 'text-color': C.forest, 'text-halo-color': C.ivory, 'text-halo-width': 1.8 } }
      ]
    };
  }

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }

  function pinElement() {
    var b = el('button', 'h-pin3d');
    b.type = 'button';
    b.setAttribute('aria-label', cfg.NAME + ' — ' + cfg.ADDRESS);
    b.innerHTML = '<svg viewBox="0 0 44 56" width="44" height="56" aria-hidden="true" focusable="false">' +
      '<ellipse class="sh" cx="22" cy="52" rx="9" ry="3"/>' +
      '<path class="body" d="M22 2C11.5 2 3.5 10 3.5 20.2 3.5 33.5 22 52 22 52s18.5-18.5 18.5-31.8C40.5 10 32.5 2 22 2z"/>' +
      '<circle class="ring" cx="22" cy="20" r="9.5"/><circle class="dot" cx="22" cy="20" r="4.2"/></svg>';
    return b;
  }

  function popupHtml() {
    return '<div class="h-pop"><p class="h-pop-name">' + cfg.NAME + '</p><p class="h-pop-addr">' + cfg.ADDRESS + '</p>' +
      '<a class="h-pop-btn" href="' + gmaps + '" target="_blank" rel="noopener"><span class="en">Open in Google Maps</span><span class="pt">Abrir no Google Maps</span></a></div>';
  }

  function showMap() {
    if (done) return; done = true;
    wrap.classList.add('is-hsto');
    box.hidden = false;
    if (window.hMapInstance) window.hMapInstance.resize();
  }
  function fallback(why) {
    if (done) return; done = true;
    console.warn('[HSTO mapa] A usar o mapa do Google:', why);
    try { if (window.hMapInstance) window.hMapInstance.remove(); } catch (e) {}
    box.hidden = true; wrap.classList.remove('is-hsto');
  }

  function init() {
    var gl = window.maplibregl, map;
    var ptHelp = { 'CooperativeGesturesHandler.WindowsHelpText': 'Use Ctrl + roda do rato para ampliar o mapa', 'CooperativeGesturesHandler.MacHelpText': 'Use ⌘ + deslocar para ampliar o mapa', 'CooperativeGesturesHandler.MobileHelpText': 'Use dois dedos para mover o mapa' };
    try {
      map = new gl.Map({
        container: box, style: style(), center: cfg.HSTO_CENTER, zoom: cfg.ZOOM, pitch: cfg.PITCH, bearing: cfg.BEARING,
        minZoom: 13, maxZoom: 19.5, maxPitch: 70, attributionControl: false, cooperativeGestures: true,
        locale: document.documentElement.lang === 'en' ? undefined : ptHelp
      });
    } catch (err) { return fallback(err && err.message); }
    window.hMapInstance = map;

    map.addControl(new gl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new gl.AttributionControl({ compact: true, customAttribution: '© MapTiler © OpenStreetMap contributors' }), 'bottom-right');

    var popup = new gl.Popup({ offset: [0, -46], closeButton: true, maxWidth: '260px', className: 'h-popup' }).setHTML(popupHtml());
    var pin = pinElement();
    var marker = new gl.Marker({ element: pin, anchor: 'bottom' }).setLngLat(cfg.HSTO_CENTER).setPopup(popup).addTo(map);
    pin.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); marker.togglePopup(); } });

    var timer = setTimeout(function () { fallback('timeout'); }, 12000);
    map.on('load', function () { clearTimeout(timer); showMap(); map.resize(); });
    map.on('error', function (e) { if (!done) { clearTimeout(timer); fallback(e && e.error && e.error.message); } });
    if (window.ResizeObserver) new ResizeObserver(function () { map.resize(); }).observe(wrap);
  }

  function loadGL(cb) {
    if (window.maplibregl) return cb();
    var l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://unpkg.com/maplibre-gl@' + GL_VER + '/dist/maplibre-gl.css'; document.head.appendChild(l);
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/maplibre-gl@' + GL_VER + '/dist/maplibre-gl.js';
    s.onload = cb; s.onerror = function () { fallback('script'); };
    document.head.appendChild(s);
  }

  function start() { if (started) return; started = true; loadGL(init); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '300px' });
    io.observe(wrap);
  } else start();
})();
