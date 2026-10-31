# GroceryBot Clipper

A small Chrome extension that clips **every** digital coupon on your grocery
accounts in one click, using the browser you're already signed in with.

| Store | Status | How it clips |
|---|---|---|
| H-E-B | ✅ Working | H-E-B's own coupon list and `CouponClip` request |
| Target Circle | ✅ Working | Target's offer list and its "save offer" request (only *Coupons to apply* need saving; other Circle deals apply automatically) |
| Albertsons family: Albertsons, Tom Thumb, Safeway, Vons, Randalls, Jewel-Osco, Acme, Shaw's, Star Market, Pavilions, Andronico's, Carrs, Haggen, Kings, Balducci's | ✅ Working (tested on Tom Thumb) | The "for U" coupon gallery and clip requests. Never touches points-redemption rewards. |
| CVS ExtraCare | ✅ Working | Presses the page's own "Send to card" buttons (CVS only accepts its own page's requests). Sends ExtraBucks rewards to your card too, which spends nothing. |
| Walgreens | ✅ Working | Presses the page's own "Clip" buttons. Accounts hold up to 200 clipped coupons, so the biggest dollar amounts go first. |
| BJ's Wholesale Club | 🧪 New, being tested | Presses the page's own "CLIP" buttons on My Coupons, biggest dollar amounts first. |
| Kroger family: Kroger, Ralphs, Fry's, King Soopers, Fred Meyer, Smith's, QFC, Dillons, City Market, Baker's, Gerbes, Jay C, Pay Less, Mariano's, Pick 'n Save, Metro Market, Foods Co, Food 4 Less | ✅ Working (tested on Kroger) | Kroger's coupon list and clip requests. Kroger limits how many coupons a card holds, so the most valuable coupons are clipped first. |
| Walmart Cash | ✅ Working | Presses the page's own "Get this offer" and "Next page" buttons, so Walmart's code sends every request. Slower than the others and more likely to break when Walmart redesigns the page. |

## Install

1. Download this repository (green **Code** button → **Download ZIP**) and unzip it.
2. Open `chrome://extensions` in Chrome (or Edge or Brave).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and choose the unzipped folder (the one with `manifest.json`).
5. Pin the extension from the puzzle-piece menu so the button is easy to find.

## Use

1. Sign in to the store's website normally, in this browser.
2. Open the extension's popup and check the stores you shop at (under **More stores**).
3. Either:
   - click the extension's button and choose **Clip** (or **Clip all checked stores**), or
   - open the store's coupons page and click the green **✂ Clip all coupons** button in the corner.
4. A small panel shows progress. Leave the tab open until it says it's done.

Optional: check **Run once a day automatically** in the popup. Chrome has to be
open at the time; tabs it opens close themselves when a run finishes cleanly.

The popup remembers each store's last result, for example
*"Clipped 212 of 214 new offers (2 failed) · 3 h ago"*.

## How it works

The extension doesn't log in for you and never sees your password. It runs
inside the store's own page, in the session you already have, and makes the
same requests the store's **Clip** button makes (on Walmart, which only accepts
requests from its own site code, it presses the buttons instead):

1. Fetch the full list of offers with their clipped/unclipped status.
2. Send one clip request per unclipped offer, with a short random pause between
   them so it isn't a burst of traffic.
3. Stop right away, with a plain message, if the site says you're signed out,
   asks for a human check (CAPTCHA), or starts refusing requests. It never
   tries to get around those; complete the check yourself and run it again.

Nothing leaves your browser except those requests to the store itself. There are
no servers, no analytics and no tracking. Results are kept in the extension's
local storage only.

## Project layout

```
manifest.json        Chrome extension manifest (MV3)
background.js        Opens store tabs, runs stores one at a time, saves results
stores.js            The list of supported stores
popup.html/.js/.css  The toolbar popup
content/bridge.js    Relays messages between the page and the extension
content/runner.js    Shared progress panel, pacing and result counting
content/<store>.js   One adapter per store
```

### Adding a store

1. Add an entry to `stores.js`.
2. Write `content/<id>.js`, which calls `window.__gbc.register({ id, name, isCouponPage, run })`.
   In `run(ctx)`, list the offers, call `ctx.found(total, alreadyClipped)`, then
   call `ctx.clip(async () => …returns true on success…)` once per offer.
   Throw `ctx.fail("login" | "blocked" | "error", "message for the user")` to stop.
3. Add the site to `host_permissions` and `content_scripts` in `manifest.json`.

`content/heb.js` is the simplest example to copy. Stores that share a backend
share an adapter (all Albertsons-family banners use `content/albertsons.js`,
all Kroger-family banners use `content/kroger.js`).

## Credits

The Albertsons-family endpoints follow
[nathanrcast/clip-all-coupons](https://github.com/nathanrcast/clip-all-coupons) (MIT).

## When something breaks

Stores change their websites. If a store stops working:

- Reload the store's page and try again (H-E-B in particular changes its site version often).
- Open DevTools (F12) → Console on the store's tab and look for lines starting with `[GroceryBot]`.
- Open an issue with the store name and that console output.

## Contributing

Ideas go in [Discussions](https://github.com/MrClumzy88/grocerybot-clipper/discussions),
problems and store requests in [Issues](https://github.com/MrClumzy88/grocerybot-clipper/issues).
See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add a store.

## Disclaimer

This is an unofficial personal tool. It isn't affiliated with or endorsed by
H-E-B, Target, Walmart or any other retailer. Automating coupon clipping may be
against a store's terms of use. Use it at your own risk, for your own account,
and double-check your coupons before you shop.

## License

[MIT](LICENSE)
