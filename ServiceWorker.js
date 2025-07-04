// ServiceWorker.js - FINAL GITHUB VERSION

self.importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js');

// ✅ I've added your new Google Apps Script API URL here
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzAPwI4abewLjoIgWP-amfPx5vT2gh2NjjQ8dCoHCgM8W_lNXpRl5utNjuWGiYXhmW-pg/exec";

const CACHE_NAME = 'wfc-github-v1';
// Add other files to cache as needed, like your main HTML file
const URLS_TO_CACHE = ['/', '/index.html', 'https://cdn.jsdelivr.net/npm/idb-keyval@6/dist/umd.js'];

// ... (Your 'install', 'activate', and 'fetch' event listeners remain the same) ...

async function syncIntakeForms() {
  const keys = await idbKeyval.keys();
  for (const key of keys) {
    if (key.startsWith('intake-')) {
      const payload = await idbKeyval.get(key);
      try {
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'submitIntake',
            payload: payload
          })
        });
        
        // With 'no-cors', we can't confirm success from the response, 
        // but if the fetch itself doesn't throw an error, we assume it sent.
        console.log('Successfully synced:', payload.tagId);
        await idbKeyval.del(key);

      } catch (error) {
        console.error('Fetch sync failed for', payload.tagId, '. Will retry later.', error);
        break;
      }
    }
  }
}
