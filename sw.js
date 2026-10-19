// เก็บไฟล์แอปไว้ในเครื่อง ให้เปิดได้แม้ไม่มีเน็ต
// ไฟล์ของแอป: ดึงจากเน็ตก่อน ถ้าไม่มีเน็ตใช้ของที่เก็บไว้
// Leaflet และฟอนต์: ใช้ของที่เก็บไว้ก่อน
// ข้อมูลจากชีต (script.google.com) ไม่ผ่านตัวนี้ แอปเก็บเองใน localStorage
const CACHE = "shanghai-trip-app-v6";
const FILES = ["./", "index.html", "config.js", "snapshot.js", "manifest.webmanifest", "icon.svg", "icon-180.png", "icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const lib = url.hostname === "unpkg.com" || url.hostname.endsWith("gstatic.com") || url.hostname === "fonts.googleapis.com";
  if (lib) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
