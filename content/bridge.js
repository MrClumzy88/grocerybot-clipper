// Isolated-world bridge between the extension and the page-world runner.
// The runner lives in the page's own JS world (so it can read the site's
// config and send requests exactly like the site does); this script is the
// only part that can talk to chrome.runtime.
//
// Events cross worlds as JSON strings, since object `detail`s don't.

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "gbc-run") return;
  const ready = document.documentElement.dataset.gbcReady === "1";
  if (ready) {
    window.dispatchEvent(new CustomEvent("gbc:run", { detail: JSON.stringify({ auto: !!msg.auto }) }));
  }
  sendResponse({ ready });
});

function forward(type) {
  window.addEventListener(type, (e) => {
    let data;
    try { data = JSON.parse(e.detail); } catch { return; }
    chrome.runtime.sendMessage({ type, data }).catch(() => {});
  });
}
forward("gbc:progress");
forward("gbc:done");

// Pauses between clips are timed by the service worker, which Chrome doesn't
// throttle the way it throttles timers in background tabs.
window.addEventListener("gbc:sleep", (e) => {
  let req;
  try { req = JSON.parse(e.detail); } catch { return; }
  chrome.runtime.sendMessage({ type: "sleep", ms: req.ms })
    .then(() => window.dispatchEvent(new CustomEvent("gbc:wake", { detail: String(req.id) })))
    .catch(() => {});
});
