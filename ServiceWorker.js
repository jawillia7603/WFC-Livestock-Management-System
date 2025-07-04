const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxAr2cyWKxxABAY3ybuPdXpS5hXFYWCwV5WknBAdpjJbsr08lwbe5yD_IFWKbn8TQW_3g/exec";
const CACHE_NAME = 'wfc-github-v1';
const URLS_TO_CACHE = ['/', '/index.html', '/sw.js', '/manifest.json', '/logo.png'];

self.importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js');

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(URLS_TO_CACHE)).then(self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});
self.addEventListener('sync', e => { if (e.tag === 'sync-intake') { e.waitUntil(syncIntakeForms()); } });

async function syncIntakeForms() {
  const keys = await idbKeyval.keys();
  for (const key of keys) {
    if (key.startsWith('intake-')) {
      const payload = await idbKeyval.get(key);
      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'submitIntake', payload: payload })
        });
        const result = await response.json();
        if(result.status === 'success'){
            await idbKeyval.del(key);
            console.log('Successfully synced:', payload.tagId);
        } else {
            console.error('Server sync error for', payload.tagId, ':', result.message);
        }
      } catch (error) {
        console.error('Fetch sync failed for', payload.tagId, '. Will retry later.', error);
        break; 
      }
    }
  }
}
