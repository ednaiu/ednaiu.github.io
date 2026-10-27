/* Own analytics endpoint; no credentials or third-party analytics scripts. */
(function () {
  'use strict';
  var script = document.currentScript;
  var endpoint = script && script.getAttribute('data-endpoint');
  if (!endpoint || location.protocol !== 'https:' || location.hostname !== 'ednaiu.github.io') return;
  if (navigator.globalPrivacyControl || navigator.doNotTrack === '1' || window.doNotTrack === '1') return;
  try {
    if (localStorage.getItem('portfolio.analytics.disabled') === '1') return;
  } catch (_) {}
  if (!window.crypto || !crypto.randomUUID) return;

  var sections = Array.from(document.querySelectorAll('main section[data-analytics-section]'));
  var referrer = '';
  try { referrer = new URL(document.referrer).origin; } catch (_) {}
  var data = {
    id: crypto.randomUUID(), seq: 0, active: 0, depth: 0,
    referrer: referrer,
    device: innerWidth < 768 ? 'mobile' : innerWidth < 1024 ? 'tablet' : 'desktop',
    sections: {}, clicks: {}
  };
  var lastTick = performance.now();
  var lastActivity = lastTick;
  var lastPayload = '';
  var paused = document.hidden || !document.hasFocus();

  function sample() {
    var now = performance.now();
    var elapsed = Math.max(0, Math.min(now - lastTick, 2000)) / 1000;
    lastTick = now;
    if (paused || document.hidden || !document.hasFocus() || now - lastActivity > 60000 || data.active >= 14400) return;
    elapsed = Math.min(elapsed, 14400 - data.active);
    data.active += elapsed;
    var height = Math.max(document.documentElement.scrollHeight, innerHeight);
    data.depth = Math.max(data.depth, Math.min(100, Math.round((scrollY + innerHeight) / height * 100)));
    var visible = sections.map(function (section) {
      var rect = section.getBoundingClientRect();
      return { name: section.getAttribute('data-analytics-section'), pixels: Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0)) };
    }).filter(function (item) { return item.pixels > 0; });
    var total = visible.reduce(function (sum, item) { return sum + item.pixels; }, 0);
    visible.forEach(function (item) {
      data.sections[item.name] = (data.sections[item.name] || 0) + elapsed * item.pixels / total;
    });
  }
  function send() {
    var snapshot = {
      active: Math.round(data.active * 10) / 10, depth: data.depth,
      sections: Object.fromEntries(Object.entries(data.sections).map(function (entry) { return [entry[0], Math.round(entry[1] * 10) / 10]; })),
      clicks: data.clicks
    };
    var serialized = JSON.stringify(snapshot);
    if (lastPayload === serialized) return;
    data.seq += 1;
    var body = JSON.stringify(Object.assign({}, data, snapshot));
    // text/plain avoids a preflight; keepalive also works while leaving the page.
    fetch(endpoint, { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      credentials: 'omit', mode: 'cors', keepalive: true, referrerPolicy: 'no-referrer'
    }).then(function (result) {
      if (result.ok) lastPayload = serialized;
    }).catch(function () { /* Next heartbeat retries a cumulative snapshot. */ });
  }
  ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'].forEach(function (type) {
    window.addEventListener(type, function () {
      sample();
      lastActivity = performance.now();
    }, { passive: true });
  });
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('[data-analytics-click]');
    if (!link) return;
    var name = link.getAttribute('data-analytics-click');
    data.clicks[name] = Math.min(1000, (data.clicks[name] || 0) + 1);
    sample();
    send();
  });
  function suspend() { sample(); paused = true; send(); }
  function resume() { paused = false; lastTick = lastActivity = performance.now(); sample(); }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) suspend(); else if (document.hasFocus()) resume();
  });
  window.addEventListener('blur', suspend);
  window.addEventListener('focus', resume);
  window.addEventListener('pagehide', suspend);
  window.addEventListener('pageshow', function (event) { if (event.persisted) resume(); });
  setInterval(sample, 1000);
  setInterval(function () { sample(); send(); }, 15000);
  sample();
  send();
})();
