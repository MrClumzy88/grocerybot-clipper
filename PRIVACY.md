# Privacy policy

*Last updated: October 31, 2026*

GroceryBot Clipper is a browser extension that clips digital coupons on store
websites you're already signed in to. It has no servers, no accounts, no
analytics and no tracking. This page lists everything it touches.

## What it doesn't do

- It never sees, asks for or stores your passwords. You sign in to each store
  yourself, the normal way.
- It doesn't collect, sell or share personal information.
- It doesn't send anything to the developers or to any third party.

## What it reads, and where that goes

**On store websites.** When you start a run, the extension works inside that
store's own page, in the session you're already signed in with. It reads what
the page needs to clip coupons (the list of offers, and for some stores the
store or club you shop at and the shopper token the page already holds) and
sends clip requests **only to that same store**, exactly as the store's own
Clip buttons would. On some stores it simply presses the store's own buttons.
None of this information leaves your browser except in those requests to the
store itself.

**On GitHub.** To tell you when a new version is out, the popup asks GitHub's
public API for the latest release of this project
(`api.github.com/repos/MrClumzy88/grocerybot-clipper/releases/latest`), at most
once every six hours. That request carries no personal data; like any web
request, GitHub sees your IP address. GitHub's privacy policy applies to it.

## What it stores

Everything is kept in the extension's local storage (`chrome.storage.local`) on
your computer, and nowhere else:

- which stores you checked, pinned and the order you put them in;
- whether the daily run is turned on;
- each store's last result, for example "Clipped 145 of 145 new offers" and when it ran;
- the latest release version seen on GitHub.

Removing the extension deletes all of it.

## Permissions

| Permission | Why |
|---|---|
| Access to the supported store websites | To run on those stores' coupon pages and send clip requests to them. The extension does nothing on any other site. |
| `storage` | To remember your store choices and results on your computer. |
| `alarms` | For the optional "Run once a day" setting. |

## Contact

Questions or concerns: open an issue at
https://github.com/MrClumzy88/grocerybot-clipper/issues.
