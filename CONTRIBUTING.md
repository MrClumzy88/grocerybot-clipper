# Contributing

Thanks for helping. Suggestions, bug reports and new stores are all welcome.

## Ideas and questions

Start a thread in **Discussions**. Nothing is too small.

## Something broke

Stores change their websites often, so breakage is expected. Open an issue with
the **Bug report** template and include:

- the store,
- what the progress panel or popup said,
- any lines starting with `[GroceryBot]` from DevTools (F12 → Console) on the store's tab.

Please don't paste screenshots or logs that show your account details,
loyalty card number or address.

## Want a store added?

Open an issue with the **Store request** template. The most useful thing you
can include is what the site sends when you clip one coupon by hand:
DevTools → Network → clip a coupon → the request's URL and the shape of its
body (with your own IDs and tokens removed).

## Pull requests

- One store per adapter file in `content/`, registered with the shared runner.
  `content/heb.js` is the simplest example; `CLAUDE.md` has notes on every store.
- Use the site's own requests, or its own buttons, from inside the page. Stop
  with a clear message on sign-in walls, CAPTCHAs and rate limits. Don't add
  anything that works around a site's bot protection.
- Keep it personal-data free: read store IDs and tokens from the page at run time.
- Test it on your own account and say in the PR what you saw (for example
  "Clipped 145 of 145 on Tom Thumb").
