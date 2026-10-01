/* Email signup block shared by the home page, song pages and subscriber-list.html.
   Fills any <div data-vici-signup="source-name"></div> placeholder; on pages without
   one it places itself under the last streaming link. */
(function () {
  // Kit form "Join the crew - website". The form ID is public; no API key belongs here.
  var ENDPOINT = 'https://app.kit.com/forms/9987169/subscriptions';
  var PIXEL_ID = '2289778074759371';
  var IS_LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  var COPY = {
    headline: ['Join the crew'],
    subline: 'Get new music and show dates before anyone else.',
    placeholder: 'Your email',
    button: 'Sign up!',
    sending: 'Sending...',
    success: "You're in. Check your email to confirm.",
    invalid: 'Enter a valid email address.',
    error: "That didn't go through. Try again."
  };

  // Default look matches the song pages (rounded link buttons); the "home" variant
  // matches the main site (letter-spaced titles, serif subtitles, outline buttons).
  var CSS =
    '.vs-signup{box-sizing:border-box;width:100%;max-width:600px;margin:32px auto 8px;padding:0;text-align:center;' +
      'font-family:"Roboto Condensed",Arial,sans-serif;}' +
    '.vs-signup *{box-sizing:border-box;}' +
    '.vs-headline{margin:0 0 8px;color:#fff;font-size:20px;line-height:1.3;font-weight:400;text-transform:uppercase;letter-spacing:3px;}' +
    '.vs-headline span{display:inline-block;white-space:pre;}' +
    '.vs-subline{margin:0 0 16px;color:rgba(255,255,255,.65);font-size:15px;line-height:1.5;}' +
    '.vs-form{display:flex;flex-wrap:wrap;gap:10px;margin:0;}' +
    '.vs-email{flex:1 1 220px;min-width:0;height:52px;padding:0 16px;color:#fff;font-size:16px;font-family:inherit;' +
      'background:transparent;border:1px solid rgba(255,255,255,.3);border-radius:10px;outline:none;box-shadow:none;' +
      'transition:border-color .2s;-webkit-appearance:none;appearance:none;}' +
    '.vs-email::placeholder{color:rgba(255,255,255,.5);}' +
    '.vs-email:focus{border-color:#fff;}' +
    '.vs-btn{flex:0 0 auto;height:52px;padding:0 30px;color:#111;font-size:13px;font-weight:700;font-family:inherit;' +
      'text-transform:uppercase;letter-spacing:2px;background:#fff;border:1px solid #fff;border-radius:10px;cursor:pointer;' +
      'transition:all .125s ease-in-out;}' +
    '.vs-btn:hover,.vs-btn:focus{background:transparent;color:#fff;outline:none;}' +
    '.vs-btn[disabled]{opacity:.6;cursor:default;}' +
    '.vs-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;}' +
    '.vs-msg{margin:12px 0 0;font-size:14px;color:#ff8a8a;}' +
    '.vs-msg:empty{display:none;}' +
    '.vs-done{margin:0;color:#fff;font-size:16px;line-height:1.5;}' +
    '.vs-signup--home{max-width:560px;margin:0 auto;}' +
    '.vs-signup--home .vs-headline{margin-bottom:14px;font-size:30px;letter-spacing:4px;}' +
    '.vs-signup--home .vs-subline,.vs-signup--home .vs-done{margin-bottom:26px;color:#fff;font-size:16px;' +
      'font-family:Volkhov,"Times New Roman",serif;font-style:italic;}' +
    '.vs-signup--home .vs-done{margin-bottom:0;}' +
    '.vs-signup--home .vs-email,.vs-signup--home .vs-btn{height:48px;border-radius:2px;}' +
    '.vs-signup--home .vs-btn{background:transparent;color:#fff;font-size:12px;font-weight:400;}' +
    '.vs-signup--home .vs-btn:hover,.vs-signup--home .vs-btn:focus{background:#fff;color:#111;}' +
    '@media (max-width:480px){.vs-btn{flex:1 1 100%;}.vs-signup--home .vs-headline{font-size:24px;letter-spacing:3px;}}';

  function injectStyles() {
    if (document.getElementById('vs-signup-styles')) return;
    var style = document.createElement('style');
    style.id = 'vs-signup-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Pages that don't already carry the Meta pixel get it here so Lead events can fire.
  function ensurePixel() {
    if (IS_LOCAL || typeof window.fbq === 'function') return;
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function trackLead(source) {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: source });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', { event_category: 'email_signup', event_label: source });
    }
  }

  function pageSource() {
    var name = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/^\/|\/$/g, '');
    return name || 'home';
  }

  function build(source, variant) {
    var box = document.createElement('div');
    box.className = 'vs-signup' + (variant ? ' vs-signup--' + variant : '');
    box.innerHTML =
      '<h2 class="vs-headline"></h2>' +
      '<p class="vs-subline"></p>' +
      '<form class="vs-form" novalidate>' +
        '<input class="vs-email" type="email" name="email" autocomplete="email" inputmode="email" required>' +
        '<input class="vs-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button class="vs-btn" type="submit"></button>' +
      '</form>' +
      '<p class="vs-msg" role="alert"></p>';

    var form = box.querySelector('.vs-form');
    var email = box.querySelector('.vs-email');
    var trap = box.querySelector('.vs-hp');
    var btn = box.querySelector('.vs-btn');
    var msg = box.querySelector('.vs-msg');

    // One span per sentence so the headline only ever wraps between them.
    COPY.headline.forEach(function (sentence) {
      var span = document.createElement('span');
      span.textContent = sentence + ' ';
      box.querySelector('.vs-headline').appendChild(span);
    });
    box.querySelector('.vs-subline').textContent = COPY.subline;
    email.placeholder = COPY.placeholder;
    email.setAttribute('aria-label', COPY.placeholder);
    btn.textContent = COPY.button;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      msg.textContent = '';
      var value = email.value.trim();
      if (!value || !email.checkValidity()) {
        msg.textContent = COPY.invalid;
        email.focus();
        return;
      }

      btn.disabled = true;
      btn.textContent = COPY.sending;

      // Bots fill the hidden field; show them success without saving anything.
      var send = trap.value ? Promise.resolve() : fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new URLSearchParams({ email_address: value })
      }).then(function (res) {
        if (!res.ok) throw new Error('Signup failed: ' + res.status);
        return res.json().catch(function () { return {}; });
      }).then(function (data) {
        if (data && data.status === 'failed') throw new Error('Signup rejected');
      });

      send.then(function () {
        if (!trap.value) trackLead(source);
        var done = document.createElement('p');
        done.className = 'vs-done';
        done.setAttribute('role', 'status');
        done.textContent = COPY.success;
        form.parentNode.replaceChild(done, form);
        msg.textContent = '';
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = COPY.button;
        msg.textContent = COPY.error;
      });
    });

    return box;
  }

  // Song pages have no placeholder: sit directly under the streaming links.
  function autoPlace() {
    var links = document.querySelectorAll('.platform-link, .streaming-button');
    if (!links.length) return;
    var anchor = links[links.length - 1];
    var parent = anchor.parentElement;
    if (parent && /(^|\s)(platform-links|streaming-buttons)(\s|$)/.test(parent.className)) anchor = parent;
    var next = anchor.nextElementSibling;
    if (next && /(^|\s)album-link(\s|$)/.test(next.className)) anchor = next;
    anchor.parentNode.insertBefore(build(pageSource(), ''), anchor.nextSibling);
  }

  function init() {
    injectStyles();
    ensurePixel();
    var slots = document.querySelectorAll('[data-vici-signup]');
    if (!slots.length) {
      autoPlace();
      return;
    }
    Array.prototype.forEach.call(slots, function (slot) {
      var source = slot.getAttribute('data-vici-signup') || pageSource();
      slot.appendChild(build(source, slot.getAttribute('data-variant') || ''));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
