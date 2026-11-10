/* ==========================================================================
   Midday Madness — live experience shared module
   Included by live.html (listener page) and producer.html (crew console).

   CONFIG is the ONLY place you need to touch:
     1. WIUX_STREAM_URL  — paste the verified WIUX 99.1 FM stream URL (one line).
     2. SUPABASE_URL / SUPABASE_ANON_KEY — paste after the one-time Supabase
        setup (see SUPABASE_SETUP.md). Leave empty and everything still works
        for listeners; realtime features show a graceful "coming soon" state.
   ========================================================================== */
(function (global) {
  'use strict';

  var CONFIG = {
    // >>> ONE-LINE SWAP: verified WIUX 99.1 FM stream URL goes here <<<
    // Verified 2026-09-23: MP3 128 kbps via TuneIn's CDN — plays on iPhones.
    // Found via TuneIn's station API for WIUX-LP 99.1 (reliability 100);
    // carries the live broadcast with Shoutcast metadata.
    WIUX_STREAM_URL: 'https://tunein-live-e.cdnstream1.com/11457_TIN-325776_128_PROMO.mp3',

    // Fallback when the primary fails: the station's direct HE-AAC feed
    // (plays on desktop; iOS Safari cannot decode it).
    WIUX_STREAM_URL_FALLBACK: 'https://ice25.securenetsystems.net/WIUXLP',

    // Supabase realtime backend (empty = gracefully degraded, see below)
    SUPABASE_URL: 'https://oochschszoiaohkhpyew.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vY2hzY2hzem9pYW9oa2hweWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTM2NDUsImV4cCI6MjEwNTc2OTY0NX0.X8kAw4S5LkC97HpVFVLLywcUUbpKxnWHvZed6cJMAwI',

    // Optional gate for producer.html: if non-empty, the console asks for
    // this key (stored only in sessionStorage) before showing controls.
    // Obscurity, not real security — the page is unlinked for v1.
    PRODUCER_KEY: '',

    SHOW_TZ: 'America/Indiana/Indianapolis',
    SHOW_WEEKDAY: 'Wed',          // Intl weekday short name in SHOW_TZ
    SHOW_START_MIN: 13 * 60,      // 1:00 PM ET
    SHOW_END_MIN: 14 * 60,        // 2:00 PM ET
    SITE_URL: 'https://alex22musi.github.io/midday-madness'
  };

  // Static rundown used when no realtime backend is configured (or before
  // the producer publishes segments). Times are minutes after 1:00 PM ET.
  var DEFAULT_SEGMENTS = [
    { title: 'Cold open & the weekend that was', atMin: 0 },
    { title: 'College football check-in', atMin: 12 },
    { title: 'NFL rewind', atMin: 24 },
    { title: 'IU sports', atMin: 36 },
    { title: 'Ask the hosts', atMin: 46 },
    { title: 'Hot take of the week & sign-off', atMin: 54 }
  ];

  var REACTION_EMOJI = ['🔥', '👏', '😂', '🤯', '💯'];

  // True on iPhone / iPad (including iPadOS in desktop mode).
  function isIOS() {
    try {
      var nav = (typeof navigator !== 'undefined') ? navigator : {};
      var ua = nav.userAgent || '';
      if (/iPad|iPhone|iPod/.test(ua)) return true;
      return /Macintosh/.test(ua) && nav.maxTouchPoints > 1;
    } catch (e) { return false; }
  }

  /* ---------------- timezone / show-time helpers ---------------- */

  function etParts(d, opts) {
    var out = {};
    var o = { timeZone: CONFIG.SHOW_TZ, hour12: false };
    for (var k in opts) o[k] = opts[k];
    new Intl.DateTimeFormat('en-US', o).formatToParts(d).forEach(function (p) { out[p.type] = p.value; });
    return out;
  }

  // { weekday: 'Wed', minutes: <mins since midnight ET>, seconds: <sec into the minute ET> }
  function showParts(d) {
    var p = etParts(d, { weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    return { weekday: p.weekday, minutes: parseInt(p.hour, 10) * 60 + parseInt(p.minute, 10), seconds: parseInt(p.second, 10) || 0 };
  }

  // 'live' | 'soon' | 'off'
  // preview: 'live' | 'soon' | null  (from ?preview=)
  // override: true | false | null    (LIVE_OVERRIDE)
  function showStateNow(preview, override) {
    if (preview === 'live') return 'live';
    if (preview === 'soon') return 'soon';
    if (override === true) return 'live';
    if (override === false) return 'off';
    var t = showParts(new Date());
    if (t.weekday !== CONFIG.SHOW_WEEKDAY) return 'off';
    if (t.minutes >= CONFIG.SHOW_START_MIN && t.minutes < CONFIG.SHOW_END_MIN) return 'live';
    if (t.minutes < CONFIG.SHOW_START_MIN) return 'soon';
    return 'off';
  }

  // ms from now until the upcoming Wednesday 1:00 PM ET (today counts if before 1 PM)
  function msUntilShow() {
    var nowMs = Date.now();
    for (var k = 0; k < 8; k++) {
      var cand = new Date(nowMs + k * 86400000);
      var p = showParts(cand);
      if (p.weekday === CONFIG.SHOW_WEEKDAY && (k > 0 || p.minutes < CONFIG.SHOW_START_MIN)) {
        var ymd = etParts(cand, { year: 'numeric', month: '2-digit', day: '2-digit' });
        var guess = Date.UTC(+ymd.year, +ymd.month - 1, +ymd.day, 17, 0, 0);
        var tp = etParts(new Date(guess), { year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' });
        var asUtc = Date.UTC(+tp.year, +tp.month - 1, +tp.day, (+tp.hour) % 24, +tp.minute, +tp.second);
        var offMin = Math.round((asUtc - guess) / 60000);
        var startMs = Date.UTC(+ymd.year, +ymd.month - 1, +ymd.day, 13, 0, 0) - offMin * 60000;
        return Math.max(0, startMs - nowMs);
      }
    }
    return 0;
  }

  // ms elapsed since today's 1:00 PM ET show start (0 when not in show hours)
  function msIntoShow() {
    var t = showParts(new Date());
    if (t.weekday !== CONFIG.SHOW_WEEKDAY) return 0;
    if (t.minutes < CONFIG.SHOW_START_MIN || t.minutes >= CONFIG.SHOW_END_MIN) return 0;
    return (t.minutes - CONFIG.SHOW_START_MIN) * 60000 + (t.seconds || 0) * 1000;
  }

  // 'YYYY-MM-DD' for today in show timezone (used as the shows.show_date key)
  function todayKey() {
    var p = etParts(new Date(), { year: 'numeric', month: '2-digit', day: '2-digit' });
    return p.year + '-' + p.month + '-' + p.day;
  }

  function fmtCountdown(ms) {
    var totalSec = Math.max(0, Math.ceil(ms / 1000));
    var h = Math.floor(totalSec / 3600), m = Math.floor((totalSec % 3600) / 60), s = totalSec % 60;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    return h > 0 ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s);
  }

  function fmtClock(ms) {
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    s = s % 60;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    return (h > 0 ? h + ':' : '') + pad(m) + ':' + pad(s);
  }

  /* ---------------- Supabase (guarded) ---------------- */

  // Returns a supabase client, or null when not configured. Never throws.
  function supabaseClient() {
    try {
      if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) return null;
      if (!global.supabase || !global.supabase.createClient) return null;
      if (supabaseClient._c) return supabaseClient._c;
      supabaseClient._c = global.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      return supabaseClient._c;
    } catch (e) {
      return null;
    }
  }

  function isConfigured() {
    return !!supabaseClient();
  }

  function isPlaceholderStream() {
    return !CONFIG.WIUX_STREAM_URL || CONFIG.WIUX_STREAM_URL.indexOf('REPLACE_WITH_VERIFIED') !== -1;
  }

  /* ---------------- live radio player ----------------
     Bulletproof HTML5 audio state machine.

     States: idle -> connecting -> playing -> paused
                        |              |
                        +--> reconnecting -+--> error (manual retry)
                        |
                        +--> awaiting-tap (autoplay blocked: needs one user tap)
     opts: {
       audio: HTMLAudioElement (or audio-like object for tests),
       onState: function(state, detail) — state + {attempt, inMs, buffering, message},
       timers: {setTimeout, clearTimeout, setInterval, clearInterval} (optional, for tests),
       backoff: [ms...] (optional override, for tests),
       maxAttempts: n (optional override, for tests),
       storage: {getItem,setItem} (optional, defaults to localStorage guarded),
       streamUrl: override (optional — used by ?teststream=1)
     }
  ------------------------------------------------------ */
  function createLivePlayer(opts) {
    var audio = opts.audio;
    var onState = opts.onState || function () {};
    var _w = typeof window !== 'undefined' ? window : globalThis;
    var T = opts.timers || { setTimeout: _w.setTimeout.bind(_w), clearTimeout: _w.clearTimeout.bind(_w), setInterval: _w.setInterval.bind(_w), clearInterval: _w.clearInterval.bind(_w) };
    var BACKOFF = opts.backoff || [2000, 5000, 10000, 20000, 30000];
    var MAX_ATTEMPTS = (typeof opts.maxAttempts === 'number') ? opts.maxAttempts : 5;
    var store = opts.storage || (function () {
      try { return global.localStorage; } catch (e) { return null; }
    })();
    var streamUrl = opts.streamUrl || CONFIG.WIUX_STREAM_URL;
    var placeholder = !streamUrl || streamUrl.indexOf('REPLACE_WITH_VERIFIED') !== -1;
    // Primary + fallback URLs. A ?teststream= override keeps a single URL
    // so tests stay deterministic.
    var streamUrls = [streamUrl];
    if (!opts.streamUrl && CONFIG.WIUX_STREAM_URL_FALLBACK &&
        CONFIG.WIUX_STREAM_URL_FALLBACK !== streamUrl) {
      streamUrls.push(CONFIG.WIUX_STREAM_URL_FALLBACK);
    }

    var S = {
      state: 'idle', attempt: 0, intent: null, everPlayed: false,
      lastProgressAt: 0, backoffTimer: null, watchdogTimer: null,
      urlIndex: 0, loadedUrl: null
    };

    function currentUrl() { return streamUrls[S.urlIndex] || streamUrls[0]; }
    function urlLooksLikeMp3(u) { return /\.mp3($|[?#])/i.test(u || ''); }
    // Move to the next stream URL (e.g. after SRC_NOT_SUPPORTED).
    // Returns true when another URL is available.
    function tryNextUrl() {
      if (S.urlIndex + 1 < streamUrls.length) {
        S.urlIndex += 1;
        S.loadedUrl = null;
        return true;
      }
      return false;
    }

    function mem(k, v) {
      if (!store) return v === undefined ? null : undefined;
      try {
        if (v === undefined) return store.getItem(k);
        store.setItem(k, v);
      } catch (e) {}
      return undefined;
    }

    /* ---- stream format support + iOS lock-screen integration ---- */

    // The station's direct feed is HE-AAC (audio/aacp), which iOS Safari
    // cannot decode in an <audio> element — so ask the browser up front
    // instead of failing silently after the tap. MP3 needs no pre-check:
    // every iPhone plays it.
    function streamFormatSupported() {
      try {
        if (typeof document === 'undefined' || !document.createElement) return true;
        return document.createElement('audio').canPlayType('audio/aacp') !== '';
      } catch (e) { return true; }
    }

    function enterUnsupportedState() {
      clearTimers();
      stopWatchdog();
      S.state = 'error';
      S.message = 'FORMAT_UNSUPPORTED';
      S.intent = null;
      emit();
    }

    // Feed the OS "now playing" UI (iOS lock screen / Control Center,
    // Android notification shade): show logo + show name, and make the
    // system play/pause buttons drive our player.
    var mediaSessionReady = false;
    function setupMediaSession() {
      try {
        var nav = (typeof navigator !== 'undefined') ? navigator : {};
        if (!nav.mediaSession) return;
        if (!mediaSessionReady) {
          nav.mediaSession.metadata = new MediaMetadata({
            title: 'Midday Madness',
            artist: 'WIUX 99.1 FM',
            album: 'Live on WIUX 99.1 FM — Indiana University',
            artwork: [
              { src: 'https://alex22musi.github.io/midday-madness/assets/logo.jpg', sizes: '512x512', type: 'image/jpeg' }
            ]
          });
          try { nav.mediaSession.setActionHandler('play', function () { play(); }); } catch (e) {}
          try { nav.mediaSession.setActionHandler('pause', function () { pause(); }); } catch (e) {}
          mediaSessionReady = true;
        }
      } catch (e) {}
    }

    function emit() {
      onState(S.state, {
        attempt: S.attempt,
        buffering: S.state === 'connecting' || S.state === 'reconnecting' || !!S._waiting,
        message: S.message || null
      });
    }

    function clearTimers() {
      if (S.backoffTimer) { T.clearTimeout(S.backoffTimer); S.backoffTimer = null; }
    }

    function stopWatchdog() {
      if (S.watchdogTimer) { T.clearInterval(S.watchdogTimer); S.watchdogTimer = null; }
    }

    function startWatchdog() {
      stopWatchdog();
      S.watchdogTimer = T.setInterval(function () {
        // Catch silent stalls: no timeupdate progress for 10s while we expect audio.
        if ((S.state === 'playing' || S.state === 'connecting' || S.state === 'reconnecting') &&
            Date.now() - S.lastProgressAt > 10000) {
          handleStall('watchdog: no progress for 10s');
        }
      }, 3000);
    }

    function connect() {
      clearTimers();
      S.state = 'connecting';
      S.message = null;
      emit();
      startWatchdog();
      try {
        var want = currentUrl();
        if (!audio.src || S.loadedUrl !== want) { audio.src = want; S.loadedUrl = want; }
        if (audio.preload === 'none') audio.preload = 'auto';
        audio.load();
      } catch (e) { /* fall through to play() rejection handling */ }
      var p = null;
      try { p = audio.play(); } catch (e) { p = null; }
      if (p && typeof p.catch === 'function') {
        p.catch(function (err) {
          var name = err && err.name;
          if (name === 'NotAllowedError') {
            // Autoplay with sound was blocked (no user gesture yet). Don't
            // burn through reconnect attempts — park in a tap-to-listen state.
            clearTimers();
            stopWatchdog();
            S.state = 'awaiting-tap';
            S.message = null;
            S.intent = null;
            S.attempt = 0;
            emit();
            return;
          }
          // play() rejected: bad URL or placeholder host.
          handleStall('play() rejected: ' + (name || err));
        });
      }
    }

    function scheduleReconnect(reason) {
      clearTimers();
      if (S.attempt >= MAX_ATTEMPTS) {
        stopWatchdog();
        S.state = 'error';
        // Never got audio on a device that can't decode this stream format:
        // say so plainly instead of blaming the station.
        S.message = (!S.everPlayed && (isIOS() || !streamFormatSupported()))
          ? 'FORMAT_UNSUPPORTED'
          : 'WIUX seems offline right now — try again in a bit.';
        emit();
        return;
      }
      var delay = BACKOFF[Math.min(S.attempt, BACKOFF.length - 1)];
      S.attempt += 1;
      S.state = 'reconnecting';
      S.message = null;
      emit();
      S.backoffTimer = T.setTimeout(function () {
        S.backoffTimer = null;
        connect();
      }, delay);
    }

    function handleStall(reason) {
      // Ignore stalls when the user asked to pause or we're already errored.
      if (S.intent === 'pause' || S.state === 'paused' || S.state === 'error' || S.state === 'idle') return;
      scheduleReconnect(reason);
    }

    function play() {
      if (placeholder) {
        S.state = 'setup';
        S.message = 'The live stream URL is not configured yet — check back soon.';
        emit();
        return;
      }
      // canPlayType is conservative: desktop Chromium reports '' for
      // audio/aacp yet plays the stream fine. Only pre-block on iOS, where
      // the answer is reliable and HE-AAC truly can't play. MP3 needs no
      // pre-check — every iPhone plays it, so it always proceeds.
      S.urlIndex = 0; S.loadedUrl = null;
      if (isIOS() && !urlLooksLikeMp3(currentUrl()) && !streamFormatSupported()) {
        if (!tryNextUrl()) { enterUnsupportedState(); return; }
      }
      setupMediaSession();
      S.intent = 'play';
      S.attempt = 0;
      connect();
    }

    function pause() {
      S.intent = 'pause';
      clearTimers();
      stopWatchdog();
      try { audio.pause(); } catch (e) {}
      S.state = 'paused';
      emit();
    }

    function retry() {
      S.attempt = 0;
      play();
    }

    function toggle() {
      if (S.state === 'playing' || S.state === 'connecting' || S.state === 'reconnecting') pause();
      else if (S.state === 'error' || S.state === 'setup' || S.state === 'awaiting-tap') retry();
      else play();
    }

    function getState() { return S.state; }

    /* ---- wire audio element events ---- */
    function onPlaying() {
      S.attempt = 0;
      S.intent = null;
      S.everPlayed = true;
      S._waiting = false;
      S.lastProgressAt = Date.now();
      S.state = 'playing';
      emit();
    }
    function onPauseEvent() {
      if (S.intent === 'pause') {
        S.state = 'paused';
        emit();
      } else if (S.state === 'playing' || S.state === 'connecting') {
        // Unexpected pause (e.g. iOS interruption) — try to recover.
        handleStall('unexpected pause event');
      }
    }
    function onWaiting() {
      S._waiting = true;
      emit(); // keeps current state, flips buffering flag
    }
    function onTimeUpdate() {
      try { S._t = audio.currentTime; } catch (e) {}
      S.lastProgressAt = Date.now();
      S._waiting = false;
    }
    function onStalled() { handleStall('stalled event'); }
    function onError() {
      var code = null;
      try { code = audio.error && audio.error.code; } catch (e) {}
      // MEDIA_ERR_SRC_NOT_SUPPORTED: the browser can't decode this stream
      // (e.g. iOS Safari with HE-AAC). Try the next stream URL before
      // giving up — don't burn reconnect attempts on a format issue.
      if (code === 4) {
        if (tryNextUrl()) { S.attempt = 0; connect(); return; }
        enterUnsupportedState(); return;
      }
      handleStall('error event');
    }
    function onEnded() { handleStall('stream ended unexpectedly'); }

    if (audio && audio.addEventListener) {
      audio.addEventListener('playing', onPlaying);
      audio.addEventListener('pause', onPauseEvent);
      audio.addEventListener('waiting', onWaiting);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('stalled', onStalled);
      audio.addEventListener('error', onError);
      audio.addEventListener('ended', onEnded);
    }

    /* ---- volume / mute (persisted) ---- */
    function applyVolume(vol, muted) {
      try {
        if (typeof vol === 'number') audio.volume = Math.min(1, Math.max(0, vol));
        if (typeof muted === 'boolean') audio.muted = muted;
      } catch (e) {}
      mem('mm_live_vol', String(audio.volume));
      mem('mm_live_muted', audio.muted ? '1' : '0');
    }
    function restoreVolume() {
      var v = parseFloat(mem('mm_live_vol'));
      var m = mem('mm_live_muted') === '1';
      try {
        if (isFinite(v)) audio.volume = Math.min(1, Math.max(0, v));
        audio.muted = m;
      } catch (e) {}
      return { volume: audio.volume, muted: audio.muted };
    }

    return {
      play: play, pause: pause, toggle: toggle, retry: retry,
      getState: getState, applyVolume: applyVolume, restoreVolume: restoreVolume,
      isPlaceholder: function () { return placeholder; },
      // exposed for tests
      _handleStall: handleStall, _s: S
    };
  }

  /* Should we attempt programmatic play() right now (e.g. at showtime)?
     False when there's no player, the stream isn't configured, or audio is
     already playing (never restart a live stream the user already started). */
  function shouldAttemptAutoplay(p) {
    if (!p) return false;
    try {
      if (p.isPlaceholder && p.isPlaceholder()) return false;
      return p.getState() !== 'playing';
    } catch (e) { return false; }
  }

  /* ---------------- tiny dom helpers ---------------- */
  function el(id) { return document.getElementById(id); }  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  global.MM = {
    CONFIG: CONFIG,
    DEFAULT_SEGMENTS: DEFAULT_SEGMENTS,
    REACTION_EMOJI: REACTION_EMOJI,
    showParts: showParts,
    showStateNow: showStateNow,
    msUntilShow: msUntilShow,
    msIntoShow: msIntoShow,
    todayKey: todayKey,
    fmtCountdown: fmtCountdown,
    fmtClock: fmtClock,
    supabaseClient: supabaseClient,
    isConfigured: isConfigured,
    isPlaceholderStream: isPlaceholderStream,
    createLivePlayer: createLivePlayer,
    shouldAttemptAutoplay: shouldAttemptAutoplay,
    isIOS: isIOS,
    el: el,
    esc: esc
  };
})(typeof window !== 'undefined' ? window : globalThis);
