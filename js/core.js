// ===== ONLINE / OFFLINE BADGE =====
function updateNetBadge() {
  const badge = document.getElementById('net-badge');
  if (!badge) return;
  if (navigator.onLine) {
    badge.textContent = '● Online';
    badge.style.background = 'rgba(0,212,170,0.1)';
    badge.style.color = 'var(--accent3)';
    badge.style.border = '1px solid rgba(0,212,170,0.25)';
  } else {
    badge.textContent = '◉ Offline';
    badge.style.background = 'rgba(247,201,79,0.1)';
    badge.style.color = 'var(--accent5)';
    badge.style.border = '1px solid rgba(247,201,79,0.25)';
  }
}
window.addEventListener('online', updateNetBadge);
window.addEventListener('offline', updateNetBadge);
updateNetBadge();

// ===== SERVICE WORKER =====
// Inline Service Worker via Blob URL — no separate sw.js file needed
const swCode = `
const CACHE = 'db-eknathalabs-v1';
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.add('/')).catch(() => {})
  );
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached || new Response('Offline', {status: 503}));
    })
  );
});
`;
if ('serviceWorker' in navigator) {
  const blob = new Blob([swCode], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(blob);
  navigator.serviceWorker.register(swUrl).catch(() => {});
}


