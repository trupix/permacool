(function () {
  function logEvent(name, data) {
    var payload = {
      name: name,
      data: data || {},
      ts: new Date().toISOString(),
      path: location.pathname
    };

    try {
      var key = 'permacool_events';
      var events = JSON.parse(localStorage.getItem(key) || '[]');
      events.push(payload);
      localStorage.setItem(key, JSON.stringify(events.slice(-300)));
    } catch (e) {}

    if (window.gtag) {
      window.gtag('event', name, data || {});
    }
    if (window.plausible) {
      window.plausible(name, { props: data || {} });
    }
    console.log('[track]', payload);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a,button');
    if (!a) return;
    if (a.classList.contains('btn') || a.closest('.sticky-cta')) {
      logEvent('cta_click', {
        label: (a.textContent || '').trim().slice(0, 80),
        href: a.getAttribute('href') || ''
      });
    }
  });

  var form = document.querySelector('form.contact-form');
  if (form) {
    form.addEventListener('submit', function () {
      var interest = form.querySelector('[name="interest"]');
      logEvent('quote_form_submit', {
        interest: interest ? interest.value : ''
      });
      sessionStorage.setItem('permacool_last_submit', new Date().toISOString());
    });
  }
})();