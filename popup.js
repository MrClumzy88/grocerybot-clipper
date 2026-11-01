import { STORES, sortStores } from "./stores.js";

const mine = document.getElementById("stores");
const more = document.getElementById("more-stores");
const moreBox = document.getElementById("more");
const empty = document.getElementById("empty");
const tpl = document.getElementById("store-row");
const live = document.getElementById("live");
const runAll = document.getElementById("run-all");
const daily = document.getElementById("daily");
const notice = document.getElementById("notice");
const rows = {};
let settings = {};

function ago(ts) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`;
}

function saveSettings(patch) {
  settings = { ...settings, ...patch };
  chrome.storage.local.set({ settings });
  chrome.runtime.sendMessage({ type: "settings-changed" });
}

const isMine = (s) => !s.comingSoon && (settings.enabled?.[s.id] || settings.pinned?.[s.id]);

function render({ results = {}, live: now }) {
  // "Your stores" are the checked or pinned ones, pinned first, then in the
  // order the user dragged them into.
  const ordered = sortStores(STORES, settings);
  let count = 0;
  for (const s of ordered) {
    const row = rows[s.id];
    const on = !!settings.enabled?.[s.id] && !s.comingSoon;
    const pinned = !!settings.pinned?.[s.id];
    row.querySelector(".enabled").checked = on;
    row.querySelector(".enabled").disabled = !!s.comingSoon;
    row.querySelector(".pin").setAttribute("aria-pressed", String(pinned));
    row.querySelector(".pin").title = pinned ? "Unpin" : "Pin to top";
    row.draggable = isMine(s);
    (isMine(s) ? mine : more).append(row);
    if (isMine(s)) count++;

    const r = results[s.id];
    const p = row.querySelector(".result");
    const running = now?.store === s.id;
    p.className = `result ${running ? "running" : r?.status || ""}`;
    p.textContent = s.comingSoon ? "Coming soon."
      : running ? now.text
      : r ? `${r.message} · ${ago(r.at)}` : "Not run yet.";
    row.querySelector(".run").disabled = !!now || !!s.comingSoon || !settings.acknowledged;
  }
  empty.hidden = count > 0;
  if (!count) moreBox.open = true;
  daily.checked = settings.daily ?? false;
  daily.disabled = !settings.acknowledged;
  notice.hidden = !!settings.acknowledged;
  runAll.disabled = !!now || !settings.acknowledged || !STORES.some((s) => settings.enabled?.[s.id] && !s.comingSoon);
  live.hidden = !now;
  if (now) live.textContent = `Working on ${STORES.find((s) => s.id === now.store)?.name || now.store}…`;
}

// ── Drag to reorder "Your stores" ─────────────────────────────────────────
let dragId = null;
function clearDropMarks() {
  mine.querySelectorAll(".drop-before, .drop-after").forEach((el) => el.classList.remove("drop-before", "drop-after"));
}
mine.addEventListener("dragstart", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  dragId = li.dataset.id;
  li.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
});
mine.addEventListener("dragend", (e) => {
  e.target.closest("li")?.classList.remove("dragging");
  clearDropMarks();
  dragId = null;
});
mine.addEventListener("dragover", (e) => {
  const li = e.target.closest("li");
  if (!dragId || !li || li.dataset.id === dragId) return;
  e.preventDefault();
  clearDropMarks();
  const after = e.clientY > li.getBoundingClientRect().top + li.offsetHeight / 2;
  li.classList.add(after ? "drop-after" : "drop-before");
});
mine.addEventListener("drop", (e) => {
  const li = e.target.closest("li");
  if (!dragId || !li) return;
  e.preventDefault();
  const after = li.classList.contains("drop-after");
  clearDropMarks();
  // Only the order changes; pinned stores still sort above unpinned ones.
  const ids = [...mine.children].map((el) => el.dataset.id).filter((id) => id !== dragId);
  ids.splice(ids.indexOf(li.dataset.id) + (after ? 1 : 0), 0, dragId);
  saveSettings({ order: ids });
});

// ── Rows ─────────────────────────────────────────────────────────────────
for (const s of STORES) {
  const row = tpl.content.firstElementChild.cloneNode(true);
  row.dataset.id = s.id;
  const link = row.querySelector(".store-link");
  link.textContent = s.name;
  link.href = s.url;
  link.title = `Open ${s.name} coupons`;
  row.querySelector(".enabled").addEventListener("change", (e) => {
    saveSettings({ enabled: { ...settings.enabled, [s.id]: e.target.checked } });
  });
  row.querySelector(".pin").addEventListener("click", () => {
    const pinned = { ...settings.pinned };
    if (pinned[s.id]) delete pinned[s.id];
    else pinned[s.id] = true;
    saveSettings({ pinned });
  });
  row.querySelector(".run").addEventListener("click", () => chrome.runtime.sendMessage({ type: "run", store: s.id }));
  rows[s.id] = row;
}
runAll.addEventListener("click", () => chrome.runtime.sendMessage({ type: "run" }));
daily.addEventListener("change", () => saveSettings({ daily: daily.checked }));
document.getElementById("accept").addEventListener("click", () => saveSettings({ acknowledged: true }));

// ── "Update available" notice ─────────────────────────────────────────────
// Installs from GitHub don't update themselves, so the popup compares this
// version with the latest release (checked at most every 6 hours). Chrome Web
// Store installs update on their own (Chrome adds update_url to their
// manifest), so they skip the check.
const RELEASES = "https://api.github.com/repos/MrClumzy88/couponsweep/releases/latest";
const newer = (a, b) => {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
  return false;
};
async function checkForUpdate() {
  const { version: installed, update_url } = chrome.runtime.getManifest();
  if (update_url) return;
  let { latestRelease: latest } = await chrome.storage.local.get("latestRelease");
  if (!latest || Date.now() - latest.checkedAt > 6 * 60 * 60 * 1000) {
    try {
      const r = await fetch(RELEASES, { headers: { Accept: "application/vnd.github+json" } });
      if (r.ok) {
        const j = await r.json();
        latest = { version: String(j.tag_name || "").replace(/^v/, ""), url: j.html_url, checkedAt: Date.now() };
        await chrome.storage.local.set({ latestRelease: latest });
      }
    } catch {}
  }
  if (latest?.version && newer(latest.version, installed)) {
    const link = document.getElementById("update");
    link.href = latest.url;
    link.textContent = `Update available: version ${latest.version} (you have ${installed}) →`;
    link.hidden = false;
  }
}
checkForUpdate();

const refresh = async () => {
  const data = await chrome.storage.local.get(["settings", "results", "live"]);
  settings = data.settings || {};
  render(data);
};
chrome.storage.onChanged.addListener(refresh);
refresh();
