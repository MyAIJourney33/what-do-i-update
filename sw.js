// Offline support: the app shell is cached; data files are fetched fresh when online
// and fall back to the last copy when offline.
const CACHE = "wdiu-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request)));
});

// Instant alerts: every ping says the same thing; the app works out what it means on this phone.
self.addEventListener("push", e => e.waitUntil(self.registration.showNotification("What Do I Update?", {
  body: "New alert — open the app", icon: "icon-192.png", badge: "icon-192.png", tag: "wdiu-alert", renotify: true })));
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(wins => {
    for (const w of wins) if ("focus" in w) return w.focus();
    return clients.openWindow("./");
  }));
});
